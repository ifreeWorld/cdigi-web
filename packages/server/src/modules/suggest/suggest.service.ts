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
import {
  exportDto,
  SuggestConfigDto,
  CustomerData,
  StoreData,
} from './suggest.dto';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';
import { TransitEntity } from '../transit/transit.entity';
import { CustomerService } from '../customer/customer.service';
import { StoreEntity } from '../store/store.entity';

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

    const dateRangeStr = `${moment(week, 'gggg-ww')
      .startOf('week')
      .format(dateFormat)} —— ${moment(week, 'gggg-ww')
      .endOf('week')
      .format(dateFormat)}`;

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
      // 开启门店推荐订单
      storeSwitch,
      // 门店平均销量的周数
      storeCalcWeekCount,
      // 系数
      storeCoefficient,
      // 开启后自动检索 N 周断货的库存，并推荐补货
      storeSafeSwitch,
      // N
      storeBeforeWeekCount,
      // 最小安全库存(推荐订单会保证最小安全库存)
      storeMinSafeStock,
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
    const saleData: CustomerData[] = await this.dataSource
      .getRepository(SaleEntity)
      .createQueryBuilder('sale')
      .select('customer_id', 'customerId')
      .addSelect('week')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('week IN (:...maxWeeks)', { maxWeeks })
      .groupBy('customer_id')
      .addGroupBy('week')
      .addGroupBy('product_name')
      .getRawMany();
    // 库存数据[{customerId, week, productName, quantity}]
    const stockData: CustomerData[] = await this.dataSource
      .getRepository(StockEntity)
      .createQueryBuilder('stock')
      .select('customer_id', 'customerId')
      .addSelect('week')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('week IN (:...maxWeeks)', { maxWeeks })
      .groupBy('customer_id')
      .addGroupBy('week')
      .addGroupBy('product_name')
      .getRawMany();
    // 在途库存数据[{customerId, productName, quantity}]
    const transitData: Omit<CustomerData, 'week'>[] = await this.dataSource
      .getRepository(TransitEntity)
      .createQueryBuilder('transit')
      .select('customer_id', 'customerId')
      .addSelect('product_name', 'productName')
      .addSelect('sum(quantity)', 'quantity')
      .where('creator_id = :creatorId', { creatorId })
      .andWhere('customer_id IN (:...customerIds)', { customerIds })
      .andWhere('warehousing_date is null')
      .groupBy('customer_id')
      .addGroupBy('product_name')
      .getRawMany();
    // 遍历客户，一个客户是一个sheet
    for (const customerId of customerIds) {
      const customerName = customerMap[customerId];
      const sales = saleData.filter((item) => item.customerId === customerId);
      const stocks = stockData.filter((item) => item.customerId === customerId);
      const transits = transitData.filter(
        (item) => item.customerId === customerId,
      );
      // 这里只需要判断本周是否有销售和库存数据导入即可，因为如果没有，就不用往下了，如果有的话，说明近期是有数据导入的，可以往下
      if (!sales.some((item) => item.week === week)) {
        throw new CustomResponse(`${customerName}本周没有销售数据`);
      }
      if (!stocks.some((item) => item.week === week)) {
        throw new CustomResponse(`${customerName}本周没有库存数据`);
      }
      const header = [
        ['Brand Selling Report'],
        ['Date:', dateRangeStr],
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
        // 计算公式：(推荐订单数量 = 期望安全库存周数 * 周均销量 - 现有库存 - 未入库库存)，向上取整
        const suggestValue = Math.ceil(
          Math.max(
            Math.max(expectSafeStockPeriod * avgSales, minSafeStock) -
              productStock -
              productTransit,
            0,
          ),
        );
        data.push([
          productName,
          productStock,
          productSale,
          suggestValue > 0 ? 'Order' : 'Not Order',
          suggestValue,
        ]);
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

    if (storeSwitch) {
      // 门店直接用storeCalcWeekCount
      // 先计算出storeCalcWeekCount和storeBeforeWeekCount中的最大值，再基于这个最大值去查询数据库
      const maxWeek = Math.max(storeCalcWeekCount, storeBeforeWeekCount);
      const maxWeeks = [];
      for (let i = 0; i < maxWeek; i++) {
        maxWeeks.push(
          moment(week, 'gggg-ww')
            .subtract(i * 7, 'day')
            .format('gggg-ww'),
        );
      }
      // 门店销售数据[{customerId, week, storeName, productName, quantity}]
      const storeSaleData: StoreData[] = await this.dataSource
        .getRepository(SaleEntity)
        .createQueryBuilder('sale')
        .select('customer_id', 'customerId')
        .addSelect('week')
        .addSelect('store_name', 'storeName')
        .addSelect('product_name', 'productName')
        .addSelect('sum(quantity)', 'quantity')
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('customer_id IN (:...customerIds)', { customerIds })
        .andWhere('week IN (:...maxWeeks)', { maxWeeks })
        .groupBy('customer_id')
        .addGroupBy('week')
        .addGroupBy('store_name')
        .addGroupBy('product_name')
        .getRawMany();
      // 库存数据[{customerId, week, storeName, productName, quantity}]
      const storeStockData: StoreData[] = await this.dataSource
        .getRepository(StockEntity)
        .createQueryBuilder('stock')
        .select('customer_id', 'customerId')
        .addSelect('week')
        .addSelect('store_name', 'storeName')
        .addSelect('product_name', 'productName')
        .addSelect('sum(quantity)', 'quantity')
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('customer_id IN (:...customerIds)', { customerIds })
        .andWhere('week IN (:...maxWeeks)', { maxWeeks })
        .groupBy('customer_id')
        .addGroupBy('week')
        .addGroupBy('store_name')
        .addGroupBy('product_name')
        .getRawMany();
      // 门店列表
      const storeData: { customerId: number; storeName: string }[] =
        await this.dataSource
          .getRepository(StoreEntity)
          .createQueryBuilder('store')
          .select('customer_id', 'customerId')
          .addSelect('store_name', 'storeName')
          .where('creator_id = :creatorId', { creatorId })
          .andWhere('customer_id IN (:...customerIds)', { customerIds })
          .getRawMany();
      const storeMap: Record<number, string[]> = {};
      storeData.forEach((item) => {
        if (!storeMap[item.customerId]) {
          storeMap[item.customerId] = [];
        }
        storeMap[item.customerId].push(item.storeName);
      });

      for (const customerId of customerIds) {
        const customerName = customerMap[customerId];
        const storeNames = storeMap[customerId];
        const sales = storeSaleData.filter(
          (item) => item.customerId === customerId,
        );
        const stocks = storeStockData.filter(
          (item) => item.customerId === customerId,
        );
        // 这里只需要判断本周的门店是否有销售和库存数据导入即可，因为如果没有，就不用往下了，如果有的话，说明近期是有数据导入的，可以往下
        if (
          !sales.some(
            (item) => item.week === week && storeNames.includes(item.storeName),
          )
        ) {
          throw new CustomResponse(`${customerName}本周没有门店销售数据`);
        }
        if (
          !stocks.some(
            (item) => item.week === week && storeNames.includes(item.storeName),
          )
        ) {
          throw new CustomResponse(`${customerName}本周没有门店库存数据`);
        }

        const header = [
          ['Brand Selling Report'],
          ['Date:', dateRangeStr],
          ['Consumer:', customerName],
          ['Store', 'Model', 'Stock', 'Sellout', 'Suggestion', 'Quantity'],
        ];
        const data: [
          string,
          string,
          number,
          number,
          'Order' | 'Not Order',
          number,
        ][] = [];

        // 周均销量计算，需要查询这些周的销量，然后取平均数，如果一周内一条数据都没有，就不计算为除数中的一部分
        const weeks = [];
        for (let i = 0; i < storeCalcWeekCount; i++) {
          weeks.push(
            moment(week, 'gggg-ww')
              .subtract(i * 7, 'day')
              .format('gggg-ww'),
          );
        }
        const startWeek = weeks[weeks.length - 1];
        // 能查出来的总周数
        const weekCount = uniq(
          sales
            .filter((item) => weeks.includes(item.week))
            .map((item) => item.week),
        ).length;
        storeNames.forEach((storeName) => {
          // 先计算出需要生成推荐订单的产品型号
          const saleProducts =
            sales
              .filter(
                (item) =>
                  item.week <= week &&
                  item.storeName === storeName &&
                  item.week >= startWeek,
              )
              .map((item) => item.productName) || [];
          const stockProducts =
            stocks
              .filter(
                (item) =>
                  item.week <= week &&
                  item.storeName === storeName &&
                  item.week >= startWeek,
              )
              .map((item) => item.productName) || [];
          // 所有的产品型号
          const products = uniq([...saleProducts, ...stockProducts]);
          const temp = [];
          products.forEach((productName) => {
            // weeks的总销量
            let total = 0;
            sales
              .filter(
                (item) =>
                  item.productName === productName &&
                  item.storeName === storeName &&
                  weeks.includes(item.week),
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
                  (item) =>
                    item.productName === productName &&
                    item.storeName === storeName &&
                    item.week === week,
                )?.quantity,
              ) || 0;
            // 本周的库存数据
            const productStock =
              Number(
                stocks.find(
                  (item) =>
                    item.productName === productName &&
                    item.storeName === storeName &&
                    item.week === week,
                )?.quantity,
              ) || 0;
            /**
             * 门店计算公式
             * 门店的计算公式=周均销量*系数
             */
            let suggestValue = Math.max(avgSales * storeCoefficient, 0);
            if (storeSafeSwitch) {
              /**
               * storeSafeSwitch为true就进阶
               * 推荐数量》0，判断库存
               * 库存〉0， 推荐数量
               * 库存=0，max（推荐数量，安全库存）
               * 推荐数量=0，判断库存
               * 当期库存》0，推荐数量0；
               * 当期库存=0，判断过去库存；（递归）
               * 过去库存=0，推荐数量0；
               * 过去库存》0，安全库存。
               */
              if (suggestValue > 0) {
                if (productStock === 0) {
                  suggestValue = Math.max(suggestValue, storeMinSafeStock);
                }
              } else {
                for (let i = 1; i < storeBeforeWeekCount; i++) {
                  const loopStock =
                    Number(
                      stocks.find(
                        (item) =>
                          item.productName === productName &&
                          item.storeName === storeName &&
                          item.week === weeks[i],
                      )?.quantity,
                    ) || 0;
                  if (loopStock > 0) {
                    suggestValue = storeMinSafeStock;
                    break;
                  }
                }
              }
            }
            // 向上取整
            suggestValue = Math.ceil(suggestValue);
            temp.push([
              storeName,
              productName,
              productStock,
              productSale,
              suggestValue > 0 ? 'Order' : 'Not Order',
              suggestValue,
            ]);
          });
          // temp按照Quantity排序
          temp.sort((a, b) => {
            return a[5] < b[5] ? 1 : -1;
          });
          data.push(...temp);
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
          `${suggestStoreSheetName}(${customerName})`,
        );
      }
    }

    const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `${week.split('-')[1]} ${dateRangeStr} 推荐订单 ${
      customerIds.length > 1 ? '批量' : customerMap[customerIds[0]]
    }.xlsx`;
    return {
      fileName,
      buf,
    };
  }
}
