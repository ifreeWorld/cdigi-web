import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { TagEntity } from './tag.entity';
import { SearchDto, CreateDto, UpdateDto } from './tag.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';
import { appLogger } from '../../logger';

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
    // appLogger.log(`where is ${JSON.stringify(where)}`);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
    });
  }

  /**
   * 新增
   */
  async insert(
    info: CreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const time = new Date();
    const res = await this.repository.insert({
      ...info,
      createTime: time,
      updateTime: time,
    });
    return res.raw.insertId;
  }

  /** 修改 */
  async update(id: number, data: Partial<UpdateDto>): Promise<number> {
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
