import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkSheet, utils, write } from 'xlsx';
import * as fs from 'fs';
import * as moment from 'moment';
import { StockEntity } from './stock.entity';
import { SearchDto, StockParseDto } from './stock.dto';
import { ErrorConstant } from 'src/constant/error';
import { stockHeaderMap, stockSheetName, tmpPath } from '../../constant/file';
import { ProductService } from '../product/product.service';
import { StoreService } from '../store/store.service';
import { getTree } from './util';
import { appLogger } from 'src/logger';

export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private repository: Repository<StockEntity>,
    private dataSource: DataSource,
    private productService: ProductService,
    private storeService: StoreService,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
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

    if (validator.isNotEmpty(week)) {
      weekQb.where('stock.week = :week', { week });
    }
    if (validator.isNotEmpty(customerId)) {
      weekQb.andWhere('stock.customer_id = :customerId', { customerId });
    }
    const weeks = await weekQb.getRawMany();

    const asQb = this.dataSource
      .createQueryBuilder()
      .select()
      .from('(' + weekQb.take(take).skip(skip).getQuery() + ')', 't');

    const entitys = await this.dataSource
      .getRepository(StockEntity)
      .createQueryBuilder('stock')
      .select()
      .where('stock.week IN (' + asQb.getQuery() + ')')
      .orderBy('week')
      .setParameters(weekQb.getParameters())
      .getMany();

    const result = getTree(entitys);

    return [result, weeks.length];
  }

  /**
   * 全量查询
   */
  async findAll(query: SearchDto): Promise<StockEntity[]> {
    const where: FindOptionsWhere<StockEntity> = {};
    const { week, customerId } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    if (validator.isNotEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    return await this.repository.find({
      where: where,
    });
  }

  /**
   * 全量查询数量
   */
  async findCount(query: SearchDto): Promise<number> {
    const where: FindOptionsWhere<StockEntity> = {};
    const { week } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    return await this.repository.count({
      where: where,
    });
  }

  /**
   * 解析数据插入数据
   */
  async parseSheet(
    sheet: WorkSheet,
    fileName: string,
    body: StockParseDto,
    creatorId: number,
  ): Promise<number | ErrorConstant> {
    const { weekStartDate, weekEndDate, week, customerId } = body;

    const arrs = utils.sheet_to_json<any[]>(sheet, { header: 1 });
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

    const data = utils.sheet_to_json(sheet);
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
        }
      }
      return temp;
    });
    const entities = plainToInstance(StockEntity, result);
    const allProduct = await this.productService.findAll({});
    const allProductNames = allProduct.map((item) => item.productName);
    const allStore = await this.storeService.findAll({
      customerId,
    });
    const allStoreNames = allStore.map((item) => item.storeName);

    // 校验
    const errors = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const { productName, storeName, quantity, price, total } = entity;

      // 单元格位置文本，A1 B2
      const position = `${utils.encode_cell({
        c: colMap.productName,
        r: rowIndex,
      })}`;

      // 产品名称不在系统内
      if (productName && !allProductNames.includes(productName)) {
        const errMsg = `位置: ${position} 产品名称"${productName}"不在系统内`;
        errorsTemp.push(errMsg);
      }

      // 门店名称不在系统内，allStoreNames是关联的经销商的门店
      if (storeName && !allStoreNames.includes(storeName)) {
        const errMsg = `位置: ${position} 门店名称"${storeName}"不在系统内或门店不在此用户下`;
        errorsTemp.push(errMsg);
      }

      // 数量不是number类型
      if (quantity && !validator.isNumber(quantity)) {
        const errMsg = `位置: ${position} 数量"${quantity}"不是数字类型`;
        errorsTemp.push(errMsg);
      }

      // 价格不是number类型
      if (price && !validator.isNumber(price)) {
        const errMsg = `位置: ${position} 价格"${price}"不是数字类型`;
        errorsTemp.push(errMsg);
      }

      // 总额不是number类型
      if (total && !validator.isNumber(total)) {
        const errMsg = `位置: ${position} 总额"${storeName}"不是数字类型`;
        errorsTemp.push(errMsg);
      }

      // 有失败的话，就在entity中添加失败原因，方便进行导出
      if (errorsTemp.length > 0) {
        data[rowIndex]['失败原因'] = errorsTemp.join('，');
      }
      errors.push(...errorsTemp);
    }

    if (errors.length > 0) {
      const errorSheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      appLogger.error(errors.join('\n'));
      utils.book_append_sheet(
        workbook,
        errorSheet,
        `${stockSheetName}错误原因`,
      );

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

    // 增加一个事务，先删除，再保存
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(StockEntity)
        .where('week = :week', { week })
        .andWhere('customer_id = :customerId', { customerId })
        .execute();
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
