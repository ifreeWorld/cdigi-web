import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { StoreEntity } from './store.entity';
import { SearchDto, StoreCreateDto, StoreUpdateDto } from './store.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private repository: Repository<StoreEntity>,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[StoreEntity[], number]> {
    const where: FindOptionsWhere<StoreEntity> = {};
    const { storeName, customer } = query;
    if (validator.isNotEmpty(storeName)) {
      where.storeName = indexOfLike(storeName);
    }
    if (validator.isNotEmpty(customer)) {
      where.customer = customer;
    }
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
   * 新增
   */
  async insert(
    info: StoreCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const time = new Date();

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
      createTime: time,
      updateTime: time,
    });
    return res.raw.insertId;
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
      updateTime: new Date(),
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
