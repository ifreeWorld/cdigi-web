import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import * as fs from 'fs';
import { WorkSheet, utils, write, WorkBook } from 'xlsx';
import * as moment from 'moment';
import { StoreEntity } from './store.entity';
import { ErrorConstant } from 'src/constant/error';
import { SearchDto, StoreCreateDto, StoreUpdateDto } from './store.dto';
import { storeHeaderMap, storeSheetName, tmpPath } from '../../constant/file';
import { ERROR } from 'src/constant/error';
import { indexOfLike, lowerCase, setCreatorWhere, trim } from '../../utils';
import { CustomerService } from '../customer/customer.service';
import { appLogger } from 'src/logger';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private repository: Repository<StoreEntity>,
    private customerService: CustomerService,
    private dataSource: DataSource,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    creatorId: number,
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[StoreEntity[], number]> {
    const where: FindOptionsWhere<StoreEntity> = {};
    const { storeName, region, customerId } = query;
    if (validator.isNotEmpty(storeName)) {
      where.storeName = indexOfLike(storeName);
    }
    if (validator.isNotEmpty(region)) {
      where.region = indexOfLike(region);
    }
    if (validator.isNotEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
      relations: {
        customer: true,
      },
    });
  }

  /**
   * 全量查询
   */
  async findAll(
    query: SearchDto & {
      creatorId: number;
    },
    relation?: boolean,
  ): Promise<StoreEntity[]> {
    const where: FindOptionsWhere<StoreEntity> = {};
    const { storeName, region, customerId, creatorId } = query;
    if (validator.isNotEmpty(storeName)) {
      where.storeName = indexOfLike(storeName);
    }
    if (validator.isNotEmpty(region)) {
      where.region = indexOfLike(region);
    }
    if (validator.isNotEmpty(customerId)) {
      where.customer = {
        id: customerId,
      };
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
      relations: {
        customer: relation || false,
      },
    });
  }

  /**
   * 新增
   */
  async insert(
    info: StoreCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    // const res = await this.repository
    //   .createQueryBuilder('tbl_store')
    //   .insert()
    //   .into(StoreEntity)
    //   .values({
    //     ...info,
    //     createTime: time,
    //     updateTime: time,
    //     customer: {
    //       id: info.customerId,
    //     },
    //   })
    //   .execute();

    const res = await this.repository.insert({
      ...info,
    });
    return res.raw.insertId;
  }

  /**
   * 解析数据插入数据
   */
  async parseSheet(
    workbook: WorkBook,
    sheet: WorkSheet,
    fileName: string,
    creatorId: number,
  ): Promise<number | ErrorConstant> {
    const arrs = utils.sheet_to_json<any[]>(sheet, {
      header: 1,
    });
    if (arrs.length === 0) {
      return;
    }

    // [库存 - 型号	库存 - 门店	库存 - 数量]表头数据，顺序不一定
    const headers = arrs[0];
    // {productName: 0, 库存 - 门店: 1, 库存 - 数量: 2}
    const colMap: any = {};
    headers.forEach((header, index) => {
      const key = storeHeaderMap[header];
      if (key) {
        colMap[key] = index;
      }
    });

    // {customerName:customerId}的map toLocaleLowerCase
    const allCustomerMap = {};
    const allCustomer = await this.customerService.findAll(creatorId);
    const allCustomerNames = allCustomer.map((item) => {
      allCustomerMap[lowerCase(item.customerName)] = item.id;
      return lowerCase(item.customerName);
    });
    const allStore = await this.findAll({ creatorId });
    const allStoreNames = allStore.map((item) => lowerCase(item.storeName));

    const data = utils.sheet_to_json(sheet);
    const result = data.map((item) => {
      const temp: Partial<StoreEntity & { customer: string }> = {
        creatorId,
      };
      for (const oldKey in storeHeaderMap) {
        if (item.hasOwnProperty(oldKey)) {
          const newKey = storeHeaderMap[oldKey];
          temp[newKey] = trim(item[oldKey]);
        }
      }
      return temp;
    });
    const entities = result;

    // 校验
    const errors = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const { storeName, customer, region, storeAddress } = entity;

      // 门店名称没填写，必填字段
      if (!storeName) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.storeName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 门店名称"${storeName}"没填写`;
        errorsTemp.push(errMsg);
      }
      // 门店名称重复，系统中已存在
      if (allStoreNames.includes(lowerCase(storeName))) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.storeName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 门店名称"${storeName}"重复，系统中已存在`;
        errorsTemp.push(errMsg);
      }

      // 所属经销商不是string类型
      if (!customer || !allCustomerNames.includes(lowerCase(customer))) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.customer,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 所属经销商"${customer}"不在系统内或没填写`;
        errorsTemp.push(errMsg);
      } else {
        // 所属经销商字段校验通过的话，就给customer赋值
        // @ts-ignore
        entity.customer = {
          id: allCustomerMap[lowerCase(customer)],
        };
      }

      // 区域不是string类型
      if (region && String(region).length > 255) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.region,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 区域"${region}"超出长度限制`;
        errorsTemp.push(errMsg);
      }

      // 门店地址不是string类型
      if (storeAddress && String(storeAddress).length > 255) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.storeAddress,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 门店地址"${storeAddress}"超出长度限制`;
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
      utils.book_append_sheet(workbook, errorSheet, storeSheetName);

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

    const resultEntities = plainToInstance(StoreEntity, entities);
    // 增加一个事务，保存
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      res = await queryRunner.manager.save(resultEntities);
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

  /** 修改 */
  async update(id: number, data: Partial<StoreUpdateDto>): Promise<number> {
    const info = await this.repository.findOneBy({
      id,
    });

    if (!info) {
      throw ERROR.RESOURCE_NOT_EXITS;
    }

    await this.repository.update(id, {
      ...info,
      ...data,
    });
    return id;
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
