import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { TagEntity } from './tag.entity';
import { SearchDto } from './tag.dto';
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
    });
  }
}
