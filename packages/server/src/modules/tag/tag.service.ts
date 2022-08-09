import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { TagEntity } from './tag.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { SearchDto, TagCreateDto, TagUpdateDto } from './tag.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private repository: Repository<TagEntity>,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[TagEntity[], number]> {
    const where: FindOptionsWhere<TagEntity> = {};
    const { tagName, customerType } = query;
    if (validator.isNotEmpty(tagName)) {
      where.tagName = indexOfLike(tagName);
    }
    if (validator.isNotEmpty(customerType)) {
      where.customerType = customerType;
    }
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
      relations: {
        customers: true,
      },
    });
  }

  /**
   * 全量查询
   */
  async findAll(
    customerType: CustomerEntity['customerType'],
  ): Promise<TagEntity[]> {
    const where: FindOptionsWhere<TagEntity> = {};
    if (validator.isNotEmpty(customerType)) {
      where.customerType = customerType;
    }
    return await this.repository.find({
      where: where,
      relations: {
        customers: false,
      },
    });
  }

  /**
   * 新增
   */
  async insert(
    info: TagCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const res = await this.repository.insert({
      ...info,
    });
    return res.raw.insertId;
  }

  /** 修改 */
  async update(id: number, data: Partial<TagUpdateDto>): Promise<number> {
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