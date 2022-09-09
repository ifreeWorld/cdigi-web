import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource, In } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkBook, WorkSheet, utils, write } from 'xlsx';
import * as fs from 'fs';
import * as moment from 'moment';
import { StockEntity } from './stock.entity';
import {
  SearchDto,
  StockInnerParseResult,
  StockParseDto,
  StockSaveDto,
  Type,
} from './stock.dto';
import { ErrorConstant } from 'src/constant/error';
import {
  stockHeaderMap,
  stockSheetName,
  tmpPath,
  dateFormat,
} from '../../constant/file';
import { ProductService } from '../product/product.service';
import { StoreService } from '../store/store.service';
import { ConfigService } from '../config/config.service';
import { getTree } from './util';
import { fixImportedDate, setCreatorQb, setCreatorWhere } from '../../utils';
import { appLogger } from 'src/logger';

export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private repository: Repository<StockEntity>,
    private dataSource: DataSource,
    private productService: ProductService,
    private storeService: StoreService,
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
  ): Promise<[StockEntity[], number]> {
    const { week, customerId } = query;
    const weekQb = this.dataSource
      .getRepository(StockEntity)
      .createQueryBuilder('stock')
      .select('week')
      .distinct(true)
      .orderBy('week');

    setCreatorQb(weekQb, creatorId, 'stock');
    if (validator.isNotEmpty(week)) {
      weekQb.andWhere('stock.week = :week', { week });
    }
    if (validator.isNotEmpty(customerId)) {
      weekQb.andWhere('stock.customer_id = :customerId', { customerId });
    }
    const weeks = await weekQb.getRawMany();

    const asQb = this.dataSource
      .createQueryBuilder()
      .select()
      .from('(' + weekQb.take(take).skip(skip).getQuery() + ')', 't');

    const enQb = this.dataSource
      .getRepository(StockEntity)
      .createQueryBuilder('stock')
      .select();
    setCreatorQb(enQb, creatorId, 'stock');
    const entitys = await enQb
      .andWhere('stock.week IN (' + asQb.getQuery() + ')')
      .andWhere('stock.customer_id = :customerId', { customerId })
      .orderBy('week')
      .setParameters(weekQb.getParameters())
      .getMany();

    const result = getTree(entitys);

    return [result, weeks.length];
  }

  /**
   * 全量查询
   */
  async findAll(creatorId: number, query: SearchDto): Promise<StockEntity[]> {
    const where: FindOptionsWhere<StockEntity> = {};
    const { week, weeks, customerId } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    if (validator.isNotEmpty(weeks)) {
      where.week = In(weeks);
    }
    if (validator.isNotEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
    });
  }

  /**
   * 全量查询数量
   */
  async findCount(creatorId: number, query: SearchDto): Promise<number> {
    const where: FindOptionsWhere<StockEntity> = {};
    const { week, weeks, customerId } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    if (validator.isNotEmpty(weeks)) {
      where.week = In(weeks);
    }
    if (validator.isNotEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.count({
      where: where,
    });
  }

  /**
   * 解析数据插入数据
   */
  async parseSheet(
    workbook: WorkBook,
    sheet: WorkSheet,
    fileName: string,
    body: StockParseDto,
    creatorId: number,
  ): Promise<StockInnerParseResult | ErrorConstant> {
    const { weekStartDate, weekEndDate, week, customerId } = body;

    const arrs = utils.sheet_to_json<any[]>(sheet, {
      header: 1,
      dateNF: dateFormat,
    });
    if (arrs.length === 0) {
      return;
    }
    // [库存 - 型号	库存 - 门店	库存 - 数量]表头数据，顺序不一定
    const headers = arrs[0];
    // {productName: 0, 库存 - 门店: 1, 库存 - 数量: 2}
    const colMap: any = {};
    headers.forEach((header, index) => {
      const key = stockHeaderMap[header];
      if (key) {
        colMap[key] = index;
      }
    });
    const data = utils.sheet_to_json(sheet, {
      dateNF: dateFormat,
    });

    const hasDate = data.some((item) => !!item['库存 - 时间']);

    // 类型1为基于周进行导入，类型2为基于excel中的日期进行导入，类型2需要根据“日期”字段计算出周
    let importType = 1;
    // week为空，说明为类型2
    if (!week || hasDate) {
      importType = 2;
    }

    // 查询周开始日
    let weekStartIndex = '1';
    if (importType === 2) {
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
    }

    const is_date1904 = workbook.Workbook.WBProps.date1904;
    const result = data.map((item) => {
      const temp: Partial<StockEntity> = {
        weekStartDate,
        weekEndDate,
        week,
        creatorId,
        // @ts-ignore
        customer: { id: customerId },
      };
      for (const oldKey in stockHeaderMap) {
        if (item.hasOwnProperty(oldKey)) {
          const newKey = stockHeaderMap[oldKey];
          temp[newKey] = item[oldKey];
          // 设置sheetjs date格式的时差，https://github.com/SheetJS/sheetjs/issues/1565
          if (temp[newKey] instanceof Date) {
            temp[newKey] = fixImportedDate(temp[newKey], is_date1904);
          }
        }
      }
      return temp;
    });
    const entities = plainToInstance(StockEntity, result);
    // {productName:productId}的map
    const allProductMap = {};
    const allProduct = await this.productService.findAll(creatorId, {});
    const allProductNames = allProduct.map((item) => {
      allProductMap[item.productName] = item.id;
      return item.productName;
    });
    // {storeName:storeId}的map
    const allStoreMap = {};
    const allStore = await this.storeService.findAll({
      customerId,
      creatorId,
    });
    const allStoreNames = allStore.map((item) => {
      allStoreMap[item.storeName] = item.id;
      return item.storeName;
    });

    // 校验
    const errors = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const { productName, storeName, quantity, price, total, date } = entity;

      // 产品名称不在系统内，或者没填写，必填字段
      if (!productName || !allProductNames.includes(productName)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.productName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 产品名称"${productName}"不在系统内或没填写`;
        errorsTemp.push(errMsg);
      } else {
        // 产品名称校验通过就设置product字段
        // @ts-ignore
        entity.product = {
          id: allProductMap[productName],
        };
      }

      // 门店名称不在系统内，allStoreNames是关联的经销商的门店
      if (storeName && !allStoreNames.includes(storeName)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.storeName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 门店名称"${storeName}"不在系统内或门店不在此客户下`;
        errorsTemp.push(errMsg);
      } else {
        // 门店名称校验通过就设置store字段
        // @ts-ignore
        entity.store = {
          id: allStoreMap[storeName],
        };
      }

      // 数量不是number类型，或者没填写，必填字段
      if (quantity === undefined || !validator.isNumber(quantity)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.quantity,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 数量"${quantity}"不是数字类型或没填写`;
        errorsTemp.push(errMsg);
      }

      // 价格不是number类型
      if (price && !validator.isNumber(price)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.price,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 价格"${price}"不是数字类型`;
        errorsTemp.push(errMsg);
      }

      // 总额不是number类型
      if (total && !validator.isNumber(total)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.total,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 总额"${total}"不是数字类型`;
        errorsTemp.push(errMsg);
      }

      // 时间不是日期类型
      if (date && !validator.isDate(date)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.date,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 时间"${date}"不是日期类型`;
        errorsTemp.push(errMsg);
      }

      // 时间不是日期类型
      if (importType === 2 && !date) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.date,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 有"库存 - 时间"必须全空或者全部填写，在界面上没选周的情况下"库存 - 时间"是必填的`;
        errorsTemp.push(errMsg);
      }

      // 类型2情况下为week、weekStartDate、weekEndDate添加值
      if (importType === 2 && date) {
        const dateMoment = moment(date);
        const dateStr = dateMoment.format(dateFormat);
        const weekStr = dateMoment.format('gggg-w');
        const startDate = dateMoment.startOf('week').format(dateFormat);
        const endDate = dateMoment.endOf('week').format(dateFormat);
        entity.week = weekStr;
        // @ts-ignore
        entity.date = dateStr;
        // @ts-ignore
        entity.weekStartDate = startDate;
        // @ts-ignore
        entity.weekEndDate = endDate;
      }

      // 有失败的话，就在entity中添加失败原因，方便进行导出
      if (errorsTemp.length > 0) {
        data[rowIndex]['失败原因'] = errorsTemp.join('，');
      }
      errors.push(...errorsTemp);
    }

    if (errors.length > 0) {
      const errorSheet = utils.json_to_sheet(data, {
        header: [...headers, '失败原因'],
      });
      const workbook = utils.book_new();
      appLogger.error(errors.join('\n'));
      utils.book_append_sheet(workbook, errorSheet, stockSheetName);

      const buf = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const errorFileName = `${
        fileName.split('.xlsx')[0]
      }_错误原因_${moment().format('YYYY_MM_DD_hh_mm_ss')}.xlsx`;
      const errorFilePath = `${tmpPath}/${errorFileName}`;
      fs.writeFileSync(errorFilePath, buf);
      const e = new ErrorConstant(
        6,
        '文件校验失败，详情请查看下载的文件',
        errorFileName,
      );
      return e;
    }
    let weeks = entities.map((item) => item.week).filter((item) => !!item);
    weeks = [...new Set(weeks)];
    const repeatData = await this.findAll(creatorId, {
      customerId,
      weeks,
    });
    let repeatWeeks = repeatData
      .map((item) => item.week)
      .filter((item) => !!item);
    repeatWeeks = [...new Set(repeatWeeks)];
    const repeatWeekCount = repeatWeeks.length;

    return {
      data: entities,
      repeatWeekCount,
      repeatWeeks,
    };
  }

  async save({ data, customerId, type }: StockSaveDto) {
    const entities = plainToInstance(StockEntity, data);
    let weeks = entities.map((item) => item.week).filter((item) => !!item);
    weeks = [...new Set(weeks)];

    // 增加一个事务，先删除，再保存
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 覆盖
      if (type === Type.cover) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(StockEntity)
          .where('week IN (:...weeks)', { weeks })
          .andWhere('customer_id = :customerId', { customerId })
          .execute();
      }
      res = await queryRunner.manager.save(entities);
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      appLogger.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return res.length;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(weeks: string[], customerId: number): Promise<boolean> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(StockEntity)
      .where('week IN (:...weeks)', { weeks })
      .andWhere('customer_id = :customerId', { customerId })
      .execute();
    return true;
  }
}
