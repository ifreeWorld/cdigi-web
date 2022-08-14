import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StockEntity } from './stock.entity';
import { SearchDto } from './stock.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private repository: Repository<StockEntity>,
    private dataSource: DataSource,
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
