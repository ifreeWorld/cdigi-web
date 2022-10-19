import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import * as moment from 'moment';
import { plainToInstance } from 'class-transformer';
import { ReportEntity } from './report.entity';
import {
  SearchDto,
  ReportCreateDto,
  ReportUpdateDto,
  SummaryDto,
} from './report.dto';
import { ERROR, ErrorConstant } from 'src/constant/error';
import { setCreatorWhere } from '../../utils';
import { ConfigService } from '../config/config.service';
import { dateFormat } from 'src/constant/file';
import { getRingRatio } from './util';
import { CustomerType } from '../tag/customerType.enum';

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
    const { date, reportType } = query;
    if (validator.isNotEmpty(date)) {
      where.date = date;
    }
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
  async findAll(creatorId: number, query: SearchDto): Promise<ReportEntity[]> {
    const where: FindOptionsWhere<ReportEntity> = {};
    const { date, reportType, summary } = query;
    if (validator.isNotEmpty(date)) {
      where.date = date;
    }
    if (validator.isNotEmpty(reportType)) {
      where.reportType = reportType;
    }
    setCreatorWhere(where, creatorId);
    const data = await this.repository.find({
      where: where,
    });
    const res = [];
    for (let i = 0; i < data.length; i++) {
      const productNames = data[i].productNames;
      const summaryData = await this.summary(creatorId, {
        date,
        productNames,
        reportType: 1,
      });
      res[i] = {
        ...data[i],
        saleRingRatio: summaryData.saleRingRatio,
        stockRingRatio: summaryData.stockRingRatio,
      };
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
    stockRingRatio: Record<CustomerType, number>;
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

    let saleRingRatio = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };
    let stockRingRatio = {
      [CustomerType.vendor]: 0,
      [CustomerType.disty]: 0,
      [CustomerType.dealer]: 0,
    };

    // 周报
    if (reportType === 1) {
      const lastWeek = moment(date, 'gggg-ww')
        .subtract(7, 'day')
        .format('gggg-ww');
      const sql = `SELECT s.*, c.customer_type FROM tbl_stock s LEFT JOIN tbl_customer c ON s.customer_id = c.id`;
      const saleQb = this.dataSource
        .createQueryBuilder()
        .select('t.week')
        .addSelect('t.customer_type', 'customerType')
        .addSelect('sum(t.quantity)', 'quantity')
        .where('week IN (:...dates)', { dates: [lastWeek, date] })
        .andWhere('product_name IN (:...productNames)', {
          productNames: productNames.split(';'),
        })
        .andWhere(`creator_id = :creatorId`, { creatorId })
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('customerType')
        .orderBy('week', 'ASC');
      let curV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      let lastV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      const saleData = await saleQb.getRawMany();
      saleData.forEach((item) => {
        if (item.week === date) {
          curV[item.customerType] += Number(item.quantity);
        } else if (item.week === lastWeek) {
          lastV[item.customerType] += Number(item.quantity);
        }
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

      const stockQb = this.dataSource
        .createQueryBuilder()
        .select('week')
        .addSelect('t.customer_type', 'customerType')
        .addSelect('sum(`quantity`)', 'quantity')
        .where('week IN (:...dates)', { dates: [lastWeek, date] })
        .andWhere('product_name IN (:...productNames)', {
          productNames: productNames.split(';'),
        })
        .andWhere(`creator_id = :creatorId`, { creatorId })
        .from('(' + sql + ')', 't')
        .groupBy('week')
        .addGroupBy('customerType')
        .orderBy('week', 'ASC');
      curV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      lastV = {
        [CustomerType.vendor]: 0,
        [CustomerType.disty]: 0,
        [CustomerType.dealer]: 0,
      };
      const stockData = await stockQb.getRawMany();
      stockData.forEach((item) => {
        if (item.week === date) {
          curV[item.customerType] += Number(item.quantity);
        } else if (item.week === lastWeek) {
          lastV[item.customerType] += Number(item.quantity);
        }
      });
      stockRingRatio[CustomerType.vendor] = getRingRatio(
        curV[CustomerType.vendor],
        lastV[CustomerType.vendor],
      );
      stockRingRatio[CustomerType.disty] = getRingRatio(
        curV[CustomerType.disty],
        lastV[CustomerType.disty],
      );
      stockRingRatio[CustomerType.dealer] = getRingRatio(
        curV[CustomerType.dealer],
        lastV[CustomerType.dealer],
      );
    }
    return {
      saleRingRatio,
      stockRingRatio,
    };
  }

  /**
   * 新增
   */
  async insert(
    info: ReportCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const { reportName, reportType, productNames, date, creatorId } = info;
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
    const entity = plainToInstance(ReportEntity, {
      creatorId,
    });
    // 周报
    if (reportType === 1) {
      const year = Number(date.split('-')[0]);
      const weekalone = Number(date.split('-')[1]);
      const time = moment().year(year).week(weekalone);
      const startDate = time.startOf('week').format(dateFormat);
      const endDate = time.endOf('week').format(dateFormat);
      const month = time.startOf('week').month() + 1;
      const quarter = time.startOf('week').quarter();
      // @ts-ignore
      const monthWeek = time.startOf('week').weekOfMonth();

      entity.reportName = reportName;
      entity.productNames = productNames;
      entity.reportType = reportType;
      // @ts-ignore
      entity.startDate = startDate;
      // @ts-ignore
      entity.endDate = endDate;
      entity.date = date;
      entity.year = year;
      entity.month = month;
      entity.weekalone = weekalone;
      entity.quarter = quarter;
      entity.monthWeek = monthWeek;
    } else if (reportType === 2) {
      const year = Number(date.split('-')[0]);
      const month = Number(date.split('-')[1]);
      const time = moment()
        .year(year)
        .month(month - 1);
      const startDate = time.startOf('month').format(dateFormat);
      const endDate = time.endOf('month').format(dateFormat);
      const quarter = time.startOf('month').quarter();

      entity.reportName = reportName;
      entity.productNames = productNames;
      entity.reportType = reportType;
      // @ts-ignore
      entity.startDate = startDate;
      // @ts-ignore
      entity.endDate = endDate;
      entity.date = date;
      entity.year = year;
      entity.month = month;
      entity.quarter = quarter;
    }
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }
  /**
   * 新增
   */
  async copy(
    reportType: number,
    date: string,
    creatorId: number,
  ): Promise<number> {
    // @ts-ignore
    moment.fn.weekOfMonth = function () {
      return Math.ceil(this.date() / 7);
    };
    const data = await this.findAll(creatorId, {
      date,
      reportType,
    });
    let entities;

    // 周报
    if (reportType === 1) {
      entities = data.map((item) => {
        const { year, weekalone } = item;
        const date = moment().year(year).week(weekalone).add(1, 'weeks');

        return {
          creatorId: item.creatorId,
          reportName: item.reportName,
          productNames: item.productNames,
          reportType: item.reportType,
          startDate: date.startOf('week').format(dateFormat),
          endDate: date.endOf('week').format(dateFormat),
          date: date.format('gggg-ww'),
          year: date.year(),
          month: date.month() + 1,
          weekalone: date.week(),
          quarter: date.startOf('week').quarter(),
          // @ts-ignore
          monthWeek: date.startOf('week').weekOfMonth(),
        };
      });
    } else if (reportType === 2) {
      entities = data.map((item) => {
        const { year, month } = item;
        const date = moment()
          .year(year)
          .month(month - 1)
          .add(1, 'month');

        return {
          creatorId: item.creatorId,
          reportName: item.reportName,
          productNames: item.productNames,
          reportType: item.reportType,
          startDate: date.startOf('month').format(dateFormat),
          endDate: date.endOf('month').format(dateFormat),
          date: date.format('gggg-ww'),
          year: date.year(),
          month: date.month() + 1,
          weekalone: date.week(),
          quarter: date.startOf('month').quarter(),
          // @ts-ignore
          monthWeek: item.monthWeek,
        };
      });
    }
    const res = await this.dataSource.manager.save(entities);
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
