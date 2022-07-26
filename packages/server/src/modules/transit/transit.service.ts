import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource, Between } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkSheet, utils, write, WorkBook } from 'xlsx';
import * as fs from 'fs';
import * as moment from 'moment';
import { TransitEntity } from './transit.entity';
import { SearchDto, TransitParseDto, TransitUpdateDto } from './transit.dto';
import { ErrorConstant } from 'src/constant/error';
import {
  transitHeaderMap,
  transitSheetName,
  tmpPath,
  dateFormat,
  dateTimeFormat,
} from '../../constant/file';
import { ProductService } from '../product/product.service';
import { getTree } from './util';
import {
  fixImportedDate,
  lowerCase,
  setCreatorQb,
  setCreatorWhere,
  trim,
} from '../../utils';
import { appLogger } from 'src/logger';

export class TransitService {
  constructor(
    @InjectRepository(TransitEntity)
    private repository: Repository<TransitEntity>,
    private dataSource: DataSource,
    private productService: ProductService,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    creatorId: number,
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[TransitEntity[], number]> {
    const { inTimeStart, inTimeEnd, customerId } = query;
    const inTimeQb = this.dataSource
      .getRepository(TransitEntity)
      .createQueryBuilder('transit')
      .select('in_time')
      .distinct(true)
      .orderBy('in_time');

    setCreatorQb(inTimeQb, creatorId, 'transit');
    if (validator.isNotEmpty(inTimeStart) && validator.isNotEmpty(inTimeEnd)) {
      inTimeQb.where('transit.in_time > :inTimeStart', { inTimeStart });
      inTimeQb.andWhere('transit.in_time < :inTimeEnd', { inTimeEnd });
    }
    if (validator.isNotEmpty(customerId)) {
      inTimeQb.andWhere('transit.customer_id = :customerId', { customerId });
    }
    const inTimes = await inTimeQb.getRawMany();

    const asQb = this.dataSource
      .createQueryBuilder()
      .select()
      .from('(' + inTimeQb.take(take).skip(skip).getQuery() + ')', 't');

    const enQb = this.dataSource
      .getRepository(TransitEntity)
      .createQueryBuilder('transit')
      .select();
    setCreatorQb(enQb, creatorId, 'transit');
    const entitys = await enQb
      .andWhere('transit.in_time IN (' + asQb.getQuery() + ')')
      .andWhere('transit.customer_id = :customerId', { customerId })
      .orderBy('in_time')
      .setParameters(inTimeQb.getParameters())
      .getMany();

    const result = getTree(entitys);

    return [result, inTimes.length];
  }

  /**
   * 全量查询
   */
  async findAll(creatorId: number, query: SearchDto): Promise<TransitEntity[]> {
    const where: FindOptionsWhere<TransitEntity> = {};
    const { inTimeStart, inTimeEnd, customerId } = query;
    if (validator.isNotEmpty(inTimeStart) && validator.isNotEmpty(inTimeEnd)) {
      where.inTime = Between(inTimeStart, inTimeEnd);
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
    const where: FindOptionsWhere<TransitEntity> = {};
    const { inTimeStart, inTimeEnd, customerId } = query;
    if (validator.isNotEmpty(inTimeStart) && validator.isNotEmpty(inTimeEnd)) {
      where.inTime = Between(inTimeStart, inTimeEnd);
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
    body: TransitParseDto,
    creatorId: number,
  ): Promise<number | ErrorConstant> {
    const { customerId, eta: defaultEta } = body;
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
      const key = transitHeaderMap[header];
      if (key) {
        colMap[key] = index;
      }
    });

    const data = utils.sheet_to_json(sheet, {
      dateNF: dateFormat,
    });
    const is_date1904 = workbook.Workbook.WBProps.date1904;
    const inTime = moment().format(dateTimeFormat);
    const result = data.map((item) => {
      const temp: Partial<TransitEntity> = {
        inTime,
        creatorId,
        // @ts-ignore
        customer: { id: customerId },
      };
      for (const oldKey in transitHeaderMap) {
        if (item.hasOwnProperty(oldKey)) {
          const newKey = transitHeaderMap[oldKey];
          temp[newKey] = trim(item[oldKey]);
          // 设置sheetjs date格式的时差，https://github.com/SheetJS/sheetjs/issues/1565
          if (temp[newKey] instanceof Date) {
            temp[newKey] = fixImportedDate(temp[newKey], is_date1904);
          }
        }
      }
      return temp;
    });
    const entities = plainToInstance(TransitEntity, result);
    const allProduct = await this.productService.findAll(creatorId, {});
    const allProductNames = allProduct.map((item) =>
      lowerCase(item.productName),
    );

    // 校验
    const errors = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const { productName, quantity, price, total, eta, shippingDate } = entity;

      // 产品名称不在系统内，或者没填写，必填字段
      if (!productName || !allProductNames.includes(lowerCase(productName))) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.productName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 产品名称"${productName}"不在系统内或没填写，请注意检查半角、全角问题`;
        errorsTemp.push(errMsg);
      }

      // 数量不是number类型，或者没填写，必填字段
      if (quantity === undefined || !validator.isNumber(quantity)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.quantity,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 数量"${quantity}"不是数字类型或没填写，请注意检查半角、全角问题`;
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
      if (eta && !validator.isDate(eta) && !validator.isDateString(eta)) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.eta,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 预计到达时间"${eta}"不是日期类型`;
        errorsTemp.push(errMsg);
      } else if (!eta) {
        // eta没有填的话就需要设置默认值
        entity.eta = defaultEta;
      }

      // 时间不是日期类型
      if (
        shippingDate &&
        !validator.isDate(shippingDate) &&
        !validator.isDateString(shippingDate)
      ) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.shippingDate,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 运输时间"${shippingDate}"不是日期类型`;
        errorsTemp.push(errMsg);
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
      utils.book_append_sheet(workbook, errorSheet, transitSheetName);

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

    // 增加一个事务，保存
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
    const where: FindOptionsWhere<TransitEntity> = {};
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
    Object.keys(transitHeaderMap).forEach((key) => {
      key2Header[transitHeaderMap[key]] = key;
    });
    const data = res.map((item) => {
      return {
        [key2Header.productName]: item.productName,
        [key2Header.quantity]: item.quantity,
        [key2Header.price]: item.price,
        [key2Header.total]: item.total,
        [key2Header.shippingDate]: item.shippingDate,
        [key2Header.eta]: item.eta,
      };
    });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.json_to_sheet(data), transitSheetName);
    const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async update(body: TransitUpdateDto): Promise<boolean> {
    const { inTime, customerId, warehousingDate, eta, shippingDate } = body;
    const updater: Partial<TransitEntity> = {};
    if (!validator.isEmpty(warehousingDate)) {
      updater.warehousingDate = warehousingDate;
    }
    if (!validator.isEmpty(eta)) {
      updater.eta = eta;
    }
    if (!validator.isEmpty(shippingDate)) {
      updater.shippingDate = shippingDate;
    }
    await this.dataSource
      .createQueryBuilder()
      .update(TransitEntity)
      .set(updater)
      .where('in_time = :inTime', { inTime })
      .andWhere('customer_id = :customerId', { customerId })
      .execute();
    return true;
  }

  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(
    inTimes: TransitEntity['inTime'][],
    customerId: number,
  ): Promise<boolean> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(TransitEntity)
      .where('in_time IN (:...inTimes)', { inTimes })
      .andWhere('customer_id = :customerId', { customerId })
      .execute();
    return true;
  }
}
