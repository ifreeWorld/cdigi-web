import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource, In } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkSheet, utils, write, WorkBook } from 'xlsx';
import * as fs from 'fs';
import * as moment from 'moment';
import { SaleEntity } from './sale.entity';
import {
  SearchDto,
  SaleParseDto,
  SaleSaveDto,
  Type,
  SaleInnerParseResult,
} from './sale.dto';
import { ErrorConstant } from 'src/constant/error';
import {
  saleHeaderMap,
  saleSheetName,
  tmpPath,
  dateFormat,
} from '../../constant/file';
import { ProductService } from '../product/product.service';
import { StoreService } from '../store/store.service';
import { CustomerService } from '../customer/customer.service';
import { ConfigService } from '../config/config.service';
import { getTree } from './util';
import {
  fixImportedDate,
  lowerCase,
  setCreatorQb,
  setCreatorWhere,
  trim,
} from '../../utils';
import { appLogger } from 'src/logger';
import { CustomerEntity } from '../customer/customer.entity';

export class SaleService {
  constructor(
    @InjectRepository(SaleEntity)
    private repository: Repository<SaleEntity>,
    private dataSource: DataSource,
    private productService: ProductService,
    private storeService: StoreService,
    private customerService: CustomerService,
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
  ): Promise<[SaleEntity[], number]> {
    const { week, customerId } = query;
    const weekQb = this.dataSource
      .getRepository(SaleEntity)
      .createQueryBuilder('sale')
      .select('week')
      .distinct(true)
      .orderBy('week');

    setCreatorQb(weekQb, creatorId, 'sale');
    if (validator.isNotEmpty(week)) {
      weekQb.andWhere('sale.week = :week', { week });
    }
    if (validator.isNotEmpty(customerId)) {
      weekQb.andWhere('sale.customer_id = :customerId', { customerId });
    }
    const weeks = await weekQb.getRawMany();

    const asQb = this.dataSource
      .createQueryBuilder()
      .select()
      .from('(' + weekQb.take(take).skip(skip).getQuery() + ')', 't');

    const enQb = this.dataSource
      .getRepository(SaleEntity)
      .createQueryBuilder('sale')
      .select();
    // .leftJoinAndSelect('sale.buyer', 'buyer');
    setCreatorQb(enQb, creatorId, 'sale');
    const entitys = await enQb
      .andWhere('sale.week IN (' + asQb.getQuery() + ')')
      .andWhere('sale.customer_id = :customerId', { customerId })
      .orderBy('week')
      .setParameters(weekQb.getParameters())
      .getMany();

    const result = getTree(entitys);

    return [result, weeks.length];
  }

  /**
   * 全量查询
   */
  async findAll(creatorId: number, query: SearchDto): Promise<SaleEntity[]> {
    const where: FindOptionsWhere<SaleEntity> = {};
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
    const where: FindOptionsWhere<SaleEntity> = {};
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
    body: SaleParseDto,
    creatorId: number,
  ): Promise<SaleInnerParseResult | ErrorConstant> {
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
      const key = saleHeaderMap[header];
      if (key) {
        colMap[key] = index;
      }
    });
    const data = utils.sheet_to_json(sheet, {
      dateNF: dateFormat,
    });

    const hasDate = data.some((item) => !!item['销售 - 时间']);

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
      const temp: any = {
        weekStartDate,
        weekEndDate,
        week,
        creatorId,
        customer: { id: customerId },
      };
      for (const oldKey in saleHeaderMap) {
        if (item.hasOwnProperty(oldKey)) {
          const newKey = saleHeaderMap[oldKey];
          temp[newKey] = trim(item[oldKey]);
          // 设置sheetjs date格式的时差，https://github.com/SheetJS/sheetjs/issues/1565
          if (temp[newKey] instanceof Date) {
            temp[newKey] = fixImportedDate(temp[newKey], is_date1904);
          }
        }
      }
      return temp;
    });
    // const entities = plainToInstance(SaleEntity, result);
    const entities = result;
    // {productName:productId}的map lowerCase(
    const allProductMap = {};
    const allProduct = await this.productService.findAll(creatorId, {});
    const allProductNames = allProduct.map((item) => {
      allProductMap[lowerCase(item.productName)] = item.id;
      return lowerCase(item.productName);
    });
    // {storeName:storeId}的map
    const allStoreMap = {};
    const allStore = await this.storeService.findAll({
      customerId,
      creatorId,
    });
    const allStoreNames = allStore.map((item) => {
      allStoreMap[lowerCase(item.storeName)] = item.id;
      return lowerCase(item.storeName);
    });
    // {customerName:customerId}的map
    const allCustomerMap = {};
    const allCustomer = await this.customerService.findAllChildrenByNodeId(
      customerId,
    );
    const allCustomerNames = allCustomer.map((item) => {
      allCustomerMap[lowerCase(item.customerName)] = item.id;
      return lowerCase(item.customerName);
    });

    // 校验
    const errors = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const {
        productName,
        storeName,
        quantity,
        price,
        total,
        buyerName,
        date,
      } = entity;

      // 产品名称不在系统内，或者没填写，必填字段
      if (!productName || !allProductNames.includes(lowerCase(productName))) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.productName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 产品名称"${productName}"不在系统内或没填写，请注意检查半角、全角问题`;
        errorsTemp.push(errMsg);
      } else {
        // 产品名称校验通过就设置product字段
        entity.product = {
          id: allProductMap[lowerCase(productName)],
        };
      }

      // 门店名称不在系统内，allStoreNames是关联的经销商的门店
      if (storeName && !allStoreNames.includes(lowerCase(storeName))) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.storeName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 门店名称"${storeName}"不在系统内或门店不在此客户下，请注意检查半角、全角问题`;
        errorsTemp.push(errMsg);
      } else {
        // 门店名称校验通过就设置store字段
        entity.store = {
          id: allStoreMap[lowerCase(storeName)],
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

      // 客户名称
      if (buyerName) {
        if (!allCustomerNames.includes(lowerCase(buyerName))) {
          // 单元格位置文本，A1 B2
          const position = `${utils.encode_cell({
            c: colMap.buyerName,
            r: rowIndex + 1,
          })}`;
          const errMsg = `位置: ${position} 客户"${buyerName}"不在系统内或客户"${buyerName}"的上级供应商不是当前所选客户，请注意检查半角、全角问题`;
          errorsTemp.push(errMsg);
        } else {
          // 写了而且在系统内
          entity.buyer = {
            id: allCustomerMap[lowerCase(buyerName)],
          };
        }
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
        const errMsg = `位置: ${position} "销售 - 时间"必须全空或者全部填写，在界面上没选周的情况下"销售 - 时间"是必填的`;
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
      utils.book_append_sheet(workbook, errorSheet, saleSheetName);

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

    const resultEntities = plainToInstance(SaleEntity, entities);
    return {
      data: resultEntities,
      repeatWeekCount,
      repeatWeeks,
    };
  }

  async save({ data, customerId, type }: SaleSaveDto) {
    const entities = plainToInstance(SaleEntity, data);
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
          .from(SaleEntity)
          .where('week IN (:...weeks)', { weeks })
          .andWhere('customer_id = :customerId', { customerId })
          .execute();
      }
      // 否则直接添加
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

  async export(customerId: number, creatorId: number) {
    const where: FindOptionsWhere<SaleEntity> = {};
    setCreatorWhere(where, creatorId);
    if (!validator.isEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    const res = await this.repository.find({
      where,
    });
    const key2Header: any = {};
    Object.keys(saleHeaderMap).forEach((key) => {
      key2Header[saleHeaderMap[key]] = key;
    });
    const data = res.map((item) => {
      return {
        [key2Header.productName]: item.productName,
        [key2Header.quantity]: item.quantity,
        [key2Header.buyerName]: item.buyerName,
        [key2Header.price]: item.price,
        [key2Header.total]: item.total,
        [key2Header.date]: item.date,
        [key2Header.storeName]: item.storeName,
      };
    });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.json_to_sheet(data), saleSheetName);
    const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(weeks: string[], customerId: number): Promise<boolean> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(SaleEntity)
      .where('week IN (:...weeks)', { weeks })
      .andWhere('customer_id = :customerId', { customerId })
      .execute();
    return true;
  }
}
