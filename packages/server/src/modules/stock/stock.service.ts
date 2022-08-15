import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkSheet, utils } from 'xlsx';
import { StockEntity } from './stock.entity';
import { SearchDto } from './stock.dto';
import { ERROR, CustomResponse } from 'src/constant/error';
import { indexOfLike } from '../../utils';
import { stockHeaderMap } from '../../constant/file';
import { ProductService } from '../product/product.service';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private repository: Repository<StockEntity>,
    private dataSource: DataSource,
    private productService: ProductService,
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
  async parseSheet(sheet: WorkSheet): Promise<number> {
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

    // 校验
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const { productName } = entity;
      if (!allProductNames.includes(productName)) {
        const errMsg = `产品名称"${productName}"不在系统内`;
        throw new CustomResponse(errMsg, new Error(errMsg));
      }
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
