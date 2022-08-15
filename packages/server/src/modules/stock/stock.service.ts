import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkBook, WorkSheet, utils, write } from 'xlsx';
import { StockEntity } from './stock.entity';
import { SearchDto } from './stock.dto';
import { ERROR, CustomResponse, ErrorConstant } from 'src/constant/error';
import { indexOfLike } from '../../utils';
import { stockHeaderMap, stockSheetName } from '../../constant/file';
import { ProductService } from '../product/product.service';
import { StoreService } from '../store/store.service';

@Injectable()
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
    const where: FindOptionsWhere<StockEntity> = {};
    const { week } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
    });
  }

  /**
   * 全量查询
   */
  async findAll(query: SearchDto): Promise<StockEntity[]> {
    const where: FindOptionsWhere<StockEntity> = {};
    const { week } = query;
    if (validator.isNotEmpty(week)) {
      where.week = week;
    }
    return await this.repository.find({
      where: where,
    });
  }

  /**
   * 解析数据插入数据
   */
  async parseSheet(sheet: WorkSheet): Promise<number | ErrorConstant> {
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
      const temp = {};
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
    const allStore = await this.storeService.findAll({});
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

      // 门店名称不在系统内
      if (storeName && !allStoreNames.includes(storeName)) {
        const errMsg = `位置: ${position} 门店名称"${storeName}"不在系统内`;
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
      utils.book_append_sheet(
        workbook,
        errorSheet,
        `${stockSheetName}错误原因`,
      );

      const buf = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      // TODO 将buf写入文件中，data给文件路径，文件系统可以参考https://github.com/codebrewlab/nestjs-storage，但是nestjs-storage是不支持nestjs 9的，需要测试下或者自己重写
      // TODO 一个接口只能单一职责，要么返回json数据，要么返回xlsx文件，解析的接口返回数据比较好
      // TODO 返回xlsx文件的方式可以参考https://progressivecoder.com/nestjs-file-download-stream-explained-with-examples/
      const e = new ErrorConstant(6, '文件校验失败，详情请查看下载的文件');
      return e;
    }

    const res = await this.dataSource.manager.save(entities);
    return res.length;
  }

  // /**
  //  * 新增
  //  */
  // async batchInsert(
  //   info: StockCreateDto & {
  //     creatorId: number;
  //   },
  // ): Promise<number> {
  //   const entity = plainToInstance(StockEntity, {
  //     ...info,
  //   });
  //   const res = await this.dataSource.manager.save(entity);
  //   return res.id;
  // }

  // /** 修改 */
  // async update(id: number, data: Partial<StockUpdateDto>): Promise<number> {
  //   const info = await this.repository.findOneBy({
  //     id,
  //   });
  //   if (!info) {
  //     throw ERROR.RESOURCE_NOT_EXITS;
  //   }
  //   const entity = plainToInstance(StockEntity, {
  //     ...info,
  //     ...data,
  //   });
  //   const res = await this.dataSource.manager.save(entity);
  //   return res.id;
  // }
  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(ids: number[]): Promise<boolean> {
    await this.repository.delete(ids);
    return true;
  }
}
