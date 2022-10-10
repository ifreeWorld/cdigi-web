import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import * as moment from 'moment';
import { plainToInstance } from 'class-transformer';
import { ReportEntity } from './report.entity';
import { SearchDto, ReportCreateDto, ReportUpdateDto } from './report.dto';
import { ERROR, ErrorConstant } from 'src/constant/error';
import { setCreatorWhere } from '../../utils';
import { TagService } from '../tag/tag.service';
import { ConfigService } from '../config/config.service';
import { dateFormat } from 'src/constant/file';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private repository: Repository<ReportEntity>,
    private tagService: TagService,
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
    const { date, reportType } = query;
    if (validator.isNotEmpty(date)) {
      where.date = date;
    }
    if (validator.isNotEmpty(reportType)) {
      where.reportType = reportType;
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
    });
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
}
