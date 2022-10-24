import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource, In } from 'typeorm';
import * as validator from 'class-validator';
import * as moment from 'moment';
import { plainToInstance } from 'class-transformer';
import { ReportEntity } from './report.entity';
import {
  SearchDto,
  ReportCreateDto,
  ReportUpdateDto,
  SummaryDto,
  ReportSummaryRatio,
  DetailDto,
} from './report.dto';
import { ERROR, ErrorConstant } from 'src/constant/error';
import { setCreatorWhere } from '../../utils';
import { ConfigService } from '../config/config.service';
import { dateFormat } from 'src/constant/file';
import {
  getAvgNum,
  getAvgRatio,
  getRingRatio,
  getSameRatio,
  getStockTurn,
  sum,
} from './util';
import { CustomerType } from '../tag/customerType.enum';
import { StockEntity } from '../stock/stock.entity';
import { SaleEntity } from '../sale/sale.entity';
const allFieldText = '全部';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private repository: Repository<ReportEntity>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    creatorId: number,
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[ReportEntity[], number]> {
    const where: FindOptionsWhere<ReportEntity> = {};
    const { reportType } = query;
    if (validator.isNotEmpty(reportType)) {
      where.reportType = reportType;
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
    });
  }

  /**
   * 全量查询
   */
  async findAll(
    creatorId: number,
    body: SearchDto,
  ): Promise<(ReportEntity & ReportSummaryRatio)[]> {
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

    const where: FindOptionsWhere<ReportEntity> = {};
    const { date, reportType, summary } = body;
    if (validator.isNotEmpty(reportType)) {
      where.reportType = reportType;
    }
    setCreatorWhere(where, creatorId);
    const data = await this.repository.find({
      where: where,
    });
    let res: (ReportEntity & ReportSummaryRatio)[] = [];
    if (summary) {
      for (let i = 0; i < data.length; i++) {
        const productNames = data[i].productNames;
        const summaryData = await this.summary(creatorId, {
          date,
          productNames,
          reportType: 1,
        });
        res[i] = {
          ...data[i],
          date,
          startDate: moment(date, 'gggg-ww').startOf('week').format(dateFormat),
          endDate: moment(date, 'gggg-ww').endOf('week').format(dateFormat),
          saleRingRatio: summaryData.saleRingRatio,
          stockTurn: summaryData.stockTurn,
          saleNum: summaryData.saleNum,
          stockNum: summaryData.stockNum,
        };
      }
    } else {
      res = data.map((item) => {
        return {
          ...item,
          date,
          startDate: moment(date, 'gggg-ww').startOf('week').format(dateFormat),
          endDate: moment(date, 'gggg-ww').endOf('week').format(dateFormat),
        };
      });
    }
    return res;
  }

  /**
   * 汇总
   */
  async summary(
    creatorId: number,
    query: SummaryDto,
  ): Promise<{
    saleRingRatio: Record<CustomerType, number>;
    stockTurn: Record<CustomerType, number>;
    saleNum: Record<CustomerType, number>;
    stockNum: Record<CustomerType, number>;
  }> {
    const { date, productNames, reportType } = query;
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

    const saleRingRatio: any = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };
    const stockTurn: any = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };
    const saleNum: any = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };
    const stockNum: any = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };

    // 周报
    if (reportType === 1) {
      const lastWeek = moment(date, 'gggg-ww')
        .subtract(7, 'day')
        .format('gggg-ww');
      const last2Week = moment(date, 'gggg-ww')
        .subtract(14, 'day')
        .format('gggg-ww');
      const last3Week = moment(date, 'gggg-ww')
        .subtract(21, 'day')
        .format('gggg-ww');
      let sql = `SELECT s.*, c.customer_type FROM tbl_sale s LEFT JOIN tbl_customer c ON s.customer_id = c.id`;
      const saleQb = this.dataSource
        .createQueryBuilder()
        .select('t.week')
        .addSelect('t.customer_type', 'customerType')
        .addSelect('sum(t.quantity)', 'quantity')
        .where('week IN (:...dates)', {
          dates: [last3Week, last2Week, lastWeek, date],
        })
        .andWhere('product_name IN (:...productNames)', {
          productNames: productNames.split(';'),
        })
        .andWhere(`creator_id = :creatorId`, { creatorId })
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('customerType')
        .orderBy('week', 'ASC');
      const curV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      const lastV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      const saleData = await saleQb.getRawMany();
      let saleTotal = 0;
      saleData.forEach((item) => {
        if (item.week === date) {
          curV[item.customerType] += Number(item.quantity);
          saleNum[item.customerType] = Number(item.quantity);
        } else if (item.week === lastWeek) {
          lastV[item.customerType] += Number(item.quantity);
        }
        saleTotal += Number(item.quantity);
      });
      saleRingRatio[CustomerType.vendor] = getRingRatio(
        curV[CustomerType.vendor],
        lastV[CustomerType.vendor],
      );
      saleRingRatio[CustomerType.disty] = getRingRatio(
        curV[CustomerType.disty],
        lastV[CustomerType.disty],
      );
      saleRingRatio[CustomerType.dealer] = getRingRatio(
        curV[CustomerType.dealer],
        lastV[CustomerType.dealer],
      );

      sql = `SELECT s.*, c.customer_type FROM tbl_stock s LEFT JOIN tbl_customer c ON s.customer_id = c.id`;
      const stockQb = this.dataSource
        .createQueryBuilder()
        .select('week')
        .addSelect('t.customer_type', 'customerType')
        .addSelect('sum(`quantity`)', 'quantity')
        .where('week IN (:...dates)', { dates: [date] })
        .andWhere('product_name IN (:...productNames)', {
          productNames: productNames.split(';'),
        })
        .andWhere(`creator_id = :creatorId`, { creatorId })
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('customerType')
        .orderBy('week', 'ASC');
      const stockData = await stockQb.getRawMany();
      stockData.forEach((item) => {
        if (item.week === date) {
          stockNum[item.customerType] += Number(item.quantity);
        }
      });

      stockTurn[CustomerType.vendor] = getStockTurn(
        stockNum[CustomerType.vendor],
        saleTotal,
      );
      stockTurn[CustomerType.disty] = getStockTurn(
        stockNum[CustomerType.disty],
        saleTotal,
      );
      stockTurn[CustomerType.dealer] = getStockTurn(
        stockNum[CustomerType.dealer],
        saleTotal,
      );
    }
    return {
      saleRingRatio,
      stockTurn,
      saleNum,
      stockNum,
    };
  }

  async detail(creatorId: number, body: DetailDto) {
    const { date, reportType, productNames, customerId, customerType } = body;
    // @ts-ignore
    moment.fn.weekOfMonth = function () {
      return Math.ceil(this.date() / 7);
    };
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
    const lastWeek = moment(date, 'gggg-ww')
      .subtract(7, 'day')
      .format('gggg-ww');
    const last2Week = moment(date, 'gggg-ww')
      .subtract(14, 'day')
      .format('gggg-ww');
    const last3Week = moment(date, 'gggg-ww')
      .subtract(21, 'day')
      .format('gggg-ww');
    const last4Week = moment(date, 'gggg-ww')
      .subtract(28, 'day')
      .format('gggg-ww');
    const last5Week = moment(date, 'gggg-ww')
      .subtract(35, 'day')
      .format('gggg-ww');
    let lastSameWeek;
    // @ts-ignore
    let curMonthWeek = moment(date, 'gggg-ww').startOf('week').weekOfMonth();
    if (curMonthWeek === 5) {
      curMonthWeek = 4;
    }
    [last5Week, last4Week, last3Week, last2Week, lastWeek].forEach((item) => {
      // @ts-ignore
      const monthWeek = moment(item, 'gggg-ww').startOf('week').weekOfMonth();
      if (curMonthWeek === monthWeek) {
        lastSameWeek = item;
      }
    });
    const dates = [last5Week, last4Week, last3Week, last2Week, lastWeek, date];
    const allProductNames = productNames.split(';');

    // 周报
    if (reportType === 1) {
      let sql = `SELECT s.*, c.customer_type FROM tbl_sale s LEFT JOIN tbl_customer c ON s.customer_id = c.id`;
      const saleQb = this.dataSource
        .createQueryBuilder()
        .select('t.week', 'week')
        .addSelect('t.product_name', 'productName')
        .addSelect('sum(t.quantity)', 'quantity')
        .where('week IN (:...dates)', {
          dates: dates,
        })
        .andWhere('product_name IN (:...productNames)', {
          productNames: allProductNames,
        })
        .andWhere(`creator_id = :creatorId`, { creatorId });
      if (validator.isNotEmpty(customerId)) {
        saleQb.andWhere(`customer_id = :customerId`, { customerId });
      } else if (validator.isNotEmpty(customerType)) {
        saleQb.andWhere(`customer_type = :customerType`, { customerType });
      }
      saleQb
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('productName');
      saleQb.orderBy('week', 'ASC');
      const saleData = await saleQb.getRawMany();
      // 销售数量
      const saleNumArr = [];
      allProductNames.forEach((productName) => {
        const obj = {
          productName,
        };
        dates.forEach((d) => {
          obj[d] =
            Number(
              saleData.find(
                (item) => item.productName === productName && item.week === d,
              )?.quantity,
            ) || 0;
        });
        saleNumArr.push(obj);
      });
      // 销售数量中的汇总
      const saleSumObj = { productName: allFieldText };
      dates.forEach((d) => {
        const dNum = saleNumArr.reduce((prev, next) => prev + next[d], 0);
        saleSumObj[d] = dNum;
      });
      saleNumArr.push(saleSumObj);
      // 当前周的销售数据汇总
      const curWeekSaleTotal = saleSumObj[date];
      // 上周的销售数据汇总
      const lastWeekSaleTotal = saleSumObj[lastWeek];
      // 当前周的销售总环比
      const curWeekSaleRingRatio = getRingRatio(
        curWeekSaleTotal,
        lastWeekSaleTotal,
      );
      // 销售指标（比例）
      const saleRatioArr = [];
      allProductNames.forEach((productName) => {
        const obj: any = {
          productName,
        };
        const curWeekV =
          Number(
            saleData.find(
              (item) => item.productName === productName && item.week === date,
            )?.quantity,
          ) || 0;
        const lastWeekV =
          Number(
            saleData.find(
              (item) =>
                item.productName === productName && item.week === lastWeek,
            )?.quantity,
          ) || 0;
        const last2WeekV =
          Number(
            saleData.find(
              (item) =>
                item.productName === productName && item.week === lastWeek,
            )?.quantity,
          ) || 0;
        const last3WeekV =
          Number(
            saleData.find(
              (item) =>
                item.productName === productName && item.week === lastWeek,
            )?.quantity,
          ) || 0;
        const lastSameV =
          Number(
            saleData.find(
              (item) =>
                item.productName === productName && item.week === lastSameWeek,
            )?.quantity,
          ) || 0;
        obj.ringRatio = getRingRatio(curWeekV, lastWeekV);
        obj.sameRatio = getSameRatio(curWeekV, lastSameV);
        obj.avgRatio = getAvgRatio(
          curWeekV,
          getAvgNum([curWeekV, lastWeekV, last2WeekV, last3WeekV]),
        );

        saleRatioArr.push(obj);
      });
      // 销售指标（比例）中的汇总
      const saleRatioObj = {
        productName: allFieldText,
        ringRatio: curWeekSaleRingRatio,
        sameRatio: getSameRatio(curWeekSaleTotal, saleSumObj[lastSameWeek]),
        avgRatio: getAvgRatio(
          curWeekSaleTotal,
          getAvgNum([
            saleSumObj[date],
            saleSumObj[lastWeek],
            saleSumObj[last2Week],
            saleSumObj[last3Week],
          ]),
        ),
      };
      saleRatioArr.push(saleRatioObj);
      // 计算库存
      sql = `SELECT s.*, c.customer_type FROM tbl_stock s LEFT JOIN tbl_customer c ON s.customer_id = c.id`;
      const stockQb = this.dataSource
        .createQueryBuilder()
        .select('t.week', 'week')
        .addSelect('t.product_name', 'productName')
        .addSelect('sum(t.quantity)', 'quantity')
        .where('week IN (:...dates)', {
          dates: dates,
        })
        .andWhere('product_name IN (:...productNames)', {
          productNames: allProductNames,
        })
        .andWhere(`creator_id = :creatorId`, { creatorId });
      if (validator.isNotEmpty(customerId)) {
        stockQb.andWhere(`customer_id = :customerId`, { customerId });
      } else if (validator.isNotEmpty(customerType)) {
        stockQb.andWhere(`customer_type = :customerType`, { customerType });
      }
      stockQb
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('productName');
      stockQb.orderBy('week', 'ASC');
      const stockData = await stockQb.getRawMany();
      // 库存数量
      const stockNumArr = [];
      allProductNames.forEach((productName) => {
        const obj = {
          productName,
        };
        dates.forEach((d) => {
          obj[d] =
            Number(
              stockData.find(
                (item) => item.productName === productName && item.week === d,
              )?.quantity,
            ) || 0;
        });
        stockNumArr.push(obj);
      });
      // 库存数量中的汇总
      const stockSumObj = { productName: allFieldText };
      dates.forEach((d) => {
        const dNum = stockNumArr.reduce((prev, next) => prev + next[d], 0);
        stockSumObj[d] = dNum;
      });
      stockNumArr.push(stockSumObj);
      // 当前周的库存数据汇总
      const curWeekStockTotal = stockSumObj[date];
      // 上周的库存数据汇总
      const lastWeekStockTotal = stockSumObj[lastWeek];
      // 当前周的库存总环比
      const curWeekStockRingRatio = getRingRatio(
        curWeekStockTotal,
        lastWeekStockTotal,
      );
      // 当前周的库存周转天数
      const curWeekStockTurn = getStockTurn(
        curWeekStockTotal,
        saleSumObj[date] +
          saleSumObj[lastWeek] +
          saleSumObj[last2Week] +
          saleSumObj[last3Week],
      );
      // 库存指标（比例）
      const stockRatioArr = [];
      allProductNames.forEach((productName) => {
        const obj: any = {
          productName,
        };
        const curWeekV =
          Number(
            stockData.find(
              (item) => item.productName === productName && item.week === date,
            )?.quantity,
          ) || 0;
        const lastWeekV =
          Number(
            stockData.find(
              (item) =>
                item.productName === productName && item.week === lastWeek,
            )?.quantity,
          ) || 0;
        const lastSameV =
          Number(
            stockData.find(
              (item) =>
                item.productName === productName && item.week === lastSameWeek,
            )?.quantity,
          ) || 0;
        const sale4WeeksTotal = saleData
          .filter(
            (item) =>
              item.productName === productName &&
              [last3Week, last2Week, lastWeek, date].includes(item.week),
          )
          .map((item) => Number(item.quantity));
        obj.ringRatio = getRingRatio(curWeekV, lastWeekV);
        obj.sameRatio = getSameRatio(curWeekV, lastSameV);
        obj.turn = getStockTurn(curWeekV, sum(sale4WeeksTotal));

        stockRatioArr.push(obj);
      });
      // 库存指标（比例）中的汇总
      const stockRatioObj = {
        productName: allFieldText,
        ringRatio: curWeekStockRingRatio,
        sameRatio: getSameRatio(curWeekStockTotal, stockSumObj[lastSameWeek]),
        turn: getStockTurn(
          curWeekStockTotal,
          saleSumObj[date] +
            saleSumObj[lastWeek] +
            saleSumObj[last2Week] +
            saleSumObj[last3Week],
        ),
      };
      stockRatioArr.push(stockRatioObj);
      return {
        saleNumArr,
        saleRatioArr,
        curWeekSaleTotal,
        curWeekSaleRingRatio,
        stockNumArr,
        stockRatioArr,
        curWeekStockTotal,
        curWeekStockTurn,
      };
    }
  }

  /**
   * 新增
   */
  async insert(
    info: ReportCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const { reportName, reportType, productNames, creatorId } = info;
    const entity = plainToInstance(ReportEntity, {
      creatorId,
      reportName,
      productNames,
      reportType,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }

  /** 修改 */
  async update(id: number, data: Partial<ReportUpdateDto>): Promise<number> {
    const info = await this.repository.findOneBy({
      id,
    });
    if (!info) {
      throw ERROR.RESOURCE_NOT_EXITS;
    }
    const entity = plainToInstance(ReportEntity, {
      ...info,
      ...data,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(ids: number[]): Promise<boolean> {
    await this.repository.delete(ids);
    return true;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async deleteByReportName(reportName: string): Promise<boolean> {
    const where: FindOptionsWhere<ReportEntity> = {};
    where.reportName = reportName;
    await this.repository.delete(where);
    return true;
  }
}
