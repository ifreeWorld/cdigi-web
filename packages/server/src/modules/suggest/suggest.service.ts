import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as moment from 'moment';
import { WorkSheet, utils, write, WorkBook } from 'xlsx';
import * as validator from 'class-validator';
import { CustomResponse, ERROR } from 'src/constant/error';
import { uniq } from 'lodash';
import {
  suggestSheetName,
  suggestStoreSheetName,
  tmpPath,
  dateFormat,
} from '../../constant/file';
import { ConfigService } from '../config/config.service';
import { exportDto, SuggestConfigDto, TempData } from './suggest.dto';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';
import { TransitEntity } from '../transit/transit.entity';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class SuggestService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    private customerService: CustomerService,
  ) {}

  /**
   * 保存
   */
  async getSuggestConfig(creatorId: number): Promise<SuggestConfigDto> {
    const res = await this.configService.hget(
      'suggestConfig',
      String(creatorId),
    );
    return JSON.parse(res);
  }

  /**
   * 保存
   */
  async save(body: SuggestConfigDto, creatorId: number): Promise<boolean> {
    await this.configService.hset(
      { key: 'suggestConfig', value: JSON.stringify(body) },
      String(creatorId),
    );
    return true;
  }

  /**
   * 生成报告并下载
   */
  async export(body: exportDto, creatorId: number) {
    // 查询周开始日
    let weekStartIndex = '1';
    weekStartIndex = await this.configService.hget(
      'getWeekStartIndex',
      String(creatorId),
    );
    if (!weekStartIndex) {
      weekStartIndex = '1';
    }
    moment.locale('zh-cn', {
      week: {
        dow: Number(weekStartIndex),
      },
    });

    const { week, customerIds } = body;
    // customerId：customerName
    const customerMap = {};
    const allCustomer = await this.customerService.findAll(creatorId);
    allCustomer.forEach((item) => {
      customerMap[item.id] = item.customerName;
    });

    const wb = utils.book_new();
    // 数据获取
    const configStr = await this.configService.hget(
      'suggestConfig',
      String(creatorId),
    );
    const config: SuggestConfigDto = JSON.parse(configStr) || {};
    const {
      monthCount,
      addProduct = [],
      removeProduct = [],
      // 期望安全库存周数
      expectSafeStockPeriod,
      // 平均销量的周数
      calcWeekCount,
      // 最小安全库存(推荐订单会保证最小安全库存)
      minSafeStock,
    } = config;
    const startWeek = moment(week, 'gggg-ww')
      .subtract(monthCount, 'month')
      .format('gggg-ww');
    // 先计算出monthCount（月）和calcWeekCount（周）中的最大值，再基于这个最大值去查询数据库
    const maxWeek = Math.max(monthCount * 4, calcWeekCount);
    // 有maxWeek的数据
    const maxWeeks = [];
    for (let i = 0; i < maxWeek; i++) {
      maxWeeks.push(
        moment(week, 'gggg-ww')
          .subtract(i * 7, 'day')
          .format('gggg-ww'),
      );
    }
    // 销售数据[{customerId, week, productName, quantity}]
    const saleData: TempData[] = await this.dataSource
      .getRepository(SaleEntity)
      .createQueryBuilder('sale')
      .select('customer_id', 'customerId')
      .addSelect('week')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('week IN (:...maxWeeks)', { maxWeeks })
      .groupBy('week')
      .addGroupBy('product_name')
      .getRawMany();
    // 库存数据[{customerId, week, productName, quantity}]
    const stockData: TempData[] = await this.dataSource
      .getRepository(StockEntity)
      .createQueryBuilder('stock')
      .select('customer_id', 'customerId')
      .addSelect('week')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('week IN (:...maxWeeks)', { maxWeeks })
      .groupBy('week')
      .addGroupBy('product_name')
      .getRawMany();
    // 在途库存数据[{customerId, productName, quantity}]
    const transitData: Omit<TempData, 'week'>[] = await this.dataSource
      .getRepository(TransitEntity)
      .createQueryBuilder('transit')
      .select('customer_id', 'customerId')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('warehousing_date is null')
      .groupBy('product_name')
      .getRawMany();
    // 遍历客户，一个客户是一个sheet
    for (const customerId of customerIds) {
      const customerName = customerMap[customerId];
      // 这里只需要判断本周是否有销售和库存数据导入即可，因为如果没有，就不用往下了，如果有的话，说明近期是有数据导入的，可以往下
      if (!saleData.some((item) => item.week === week)) {
        throw new CustomResponse(`${customerName}本周没有销售数据`);
      }
      if (!stockData.some((item) => item.week === week)) {
        throw new CustomResponse(`${customerName}本周没有库存数据`);
      }
      const sales = saleData.filter((item) => item.customerId === customerId);
      const stocks = stockData.filter((item) => item.customerId === customerId);
      const transits = transitData.filter(
        (item) => item.customerId === customerId,
      );
      const header = [
        ['Brand Selling Report'],
        [
          'Date:',
          `${moment(week, 'gggg-ww').startOf('week')} —— ${moment(
            week,
            'gggg-ww',
          ).endOf('week')}`,
        ],
        ['Consumer:', customerName],
        ['Model', 'Stock', 'Sellout', 'Suggestion', 'Quantity'],
      ];
      const data: [string, number, number, 'Order' | 'Not Order', number][] =
        [];

      // 周均销量计算，需要查询这些周的销量，然后取平均数，如果一周内一条数据都没有，就不计算为除数中的一部分
      const weeks = [];
      for (let i = 0; i < calcWeekCount; i++) {
        weeks.push(
          moment(week, 'gggg-ww')
            .subtract(i * 7, 'day')
            .format('gggg-ww'),
        );
      }
      // 能查出来的总周数
      const weekCount = uniq(
        sales
          .filter((item) => weeks.includes(item.week))
          .map((item) => item.week),
      ).length;

      // 先计算出需要生成推荐订单的产品型号
      const saleProducts =
        sales
          .filter((item) => item.week <= week && item.week >= startWeek)
          .map((item) => item.productName) || [];
      const stockProducts =
        stocks
          .filter((item) => item.week <= week && item.week >= startWeek)
          .map((item) => item.productName) || [];
      // 所有的产品型号
      const products = uniq(
        [...saleProducts, ...stockProducts]
          .concat(addProduct)
          .filter((item) => !removeProduct.includes(item)),
      );
      products.forEach((productName) => {
        // weeks的总销量
        let total = 0;
        sales
          .filter(
            (item) =>
              item.productName === productName && weeks.includes(item.week),
          )
          .forEach((item) => {
            total += Number(item.quantity);
          });

        // 周均销量
        const avgSales = total / weekCount;

        // 本周的销售数据
        const productSale =
          Number(
            sales.find(
              (item) => item.productName === productName && item.week === week,
            )?.quantity,
          ) || 0;
        // 本周的库存数据
        const productStock =
          Number(
            stocks.find(
              (item) => item.productName === productName && item.week === week,
            )?.quantity,
          ) || 0;
        // 本周的在途库存数据
        const productTransit =
          Number(
            transits.find((item) => item.productName === productName)?.quantity,
          ) || 0;
        // 计算公式：(推荐订单数量 = 期望安全库存周数 * 周均销量 - 现有库存 - 未入库库存)
        const suggestValue = Math.max(
          Math.max(expectSafeStockPeriod * avgSales, minSafeStock) -
            productStock -
            productTransit,
          0,
        );
        data.push([
          productName,
          productStock,
          productSale,
          suggestValue > 0 ? 'Order' : 'Not Order',
          suggestValue,
        ]);
        /**
         * 门店计算公式
         * 门店的计算公式=周均销量*系数
         *
         * 进阶
         * 推荐数量》0，判断库存
         * 库存〉0， 推荐数量
         * 库存=0，max（推荐数量，安全库存）
         * 推荐数量=0，判断库存
         * 当期库存》0，推荐数量0；
         * 当期库存=0，判断过去库存；（递归）
         * 过去库存=0，推荐数量0；
         * 过去库存》0，安全库存。
         */
      });
      // data按照Quantity排序
      data.sort((a, b) => {
        return a[4] - b[4] < 0 ? 1 : -1;
      });
      const sheet = utils.aoa_to_sheet([...header, ...data]);
      sheet['!merges'] = [
        {
          //合并第一行数据[A1,B1,C1,D1,E1]
          s: {
            //s为开始
            c: 0, //开始列
            r: 0, //开始取值范围
          },
          e: {
            //e结束
            c: 4, //结束列
            r: 0, //结束范围
          },
        },
        {
          //合并第二行数据[B1,C1,D1,E1]
          s: {
            //s为开始
            c: 1, //开始列
            r: 1, //开始取值范围
          },
          e: {
            //e结束
            c: 4, //结束列
            r: 1, //结束范围
          },
        },
        {
          //合并第三行数据[B1,C1,D1,E1]
          s: {
            //s为开始
            c: 1, //开始列
            r: 2, //开始取值范围
          },
          e: {
            //e结束
            c: 4, //结束列
            r: 2, //结束范围
          },
        },
      ];
      utils.book_append_sheet(
        wb,
        sheet,
        `${suggestSheetName}(${customerName})`,
      );
    }

    // // 门店销售数据[{customerId, week, storeName, productName, quantity}]
    // const storeSaleData: TempData[] = await this.dataSource
    //   .getRepository(SaleEntity)
    //   .createQueryBuilder('sale')
    //   .select('customer_id', 'customerId')
    //   .addSelect('week')
    //   .addSelect('product_name', 'productName')
    //   .addSelect('sum(quantity)', 'quantity')
    //   .where('creator_id = :creatorId', { creatorId })
    //   .andWhere('customer_id IN (:...customerIds)', { customerIds })
    //   .andWhere('week IN (:...maxWeeks)', { maxWeeks })
    //   .groupBy('week')
    //   .addGroupBy('product_name')
    //   .getRawMany();
    // // 库存数据[{customerId, week, storeName, productName, quantity}]
    // const storeStockData: TempData[] = await this.dataSource
    //   .getRepository(StockEntity)
    //   .createQueryBuilder('stock')
    //   .select('customer_id', 'customerId')
    //   .addSelect('week')
    //   .addSelect('product_name', 'productName')
    //   .addSelect('sum(quantity)', 'quantity')
    //   .where('creator_id = :creatorId', { creatorId })
    //   .andWhere('customer_id IN (:...customerIds)', { customerIds })
    //   .andWhere('week IN (:...maxWeeks)', { maxWeeks })
    //   .groupBy('week')
    //   .addGroupBy('product_name')
    //   .getRawMany();

    const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }
}
