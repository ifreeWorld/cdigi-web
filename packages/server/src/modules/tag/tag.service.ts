import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private repository: Repository<TagEntity>,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(skip: number, take: number): Promise<[FrontWeekly[], number]> {
    const where: FindConditions<FrontWeekly> = {};
    if (validator.isArray(ids)) {
      where.id = In(ids);
    }
    if (validator.isNotEmpty(title)) {
      where.title = indexOfLike(title);
    }
    if (validator.isNotEmpty(product)) {
      where.product = product;
    }
    if (validator.isNotEmpty(duty_user)) {
      where.duty_user = duty_user;
    }
    if (validator.isNotEmpty(demand_user)) {
      where.demand_user = demand_user;
    }
    if (validator.isNotEmpty(update_iteration_branch)) {
      where.update_iteration_branch = update_iteration_branch;
    }
    if (validator.isNotEmpty(status)) {
      where.status = status;
    }
    if (validator.isNotEmpty(ddl_start) && validator.isNotEmpty(ddl_end)) {
      where.ddl = compareOperator(ddl_start, ddl_end);
    }
    if (
      validator.isNotEmpty(create_time_start) &&
      validator.isNotEmpty(create_time_end)
    ) {
      where.create_time = compareOperator(create_time_start, create_time_end);
    }
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
    });
  }
}
