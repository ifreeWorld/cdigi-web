import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CustomerEntity } from './customer.entity';
import {
  SearchDto,
  CustomerCreateDto,
  CustomerUpdateDto,
} from './customer.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private repository: Repository<CustomerEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[CustomerEntity[], number]> {
    const where: FindOptionsWhere<CustomerEntity> = {};
    const { customerName, customerType } = query;
    if (validator.isNotEmpty(customerName)) {
      where.customerName = indexOfLike(customerName);
    }
    if (validator.isNotEmpty(customerType)) {
      where.customerType = customerType;
    }
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
      relations: {
        tags: true,
      },
    });
  }

  /**
   * 全量查询
   */
  async findAll(
    customerType: CustomerEntity['customerType'],
  ): Promise<CustomerEntity[]> {
    const where: FindOptionsWhere<CustomerEntity> = {};
    if (validator.isNotEmpty(customerType)) {
      where.customerType = customerType;
    }
    return await this.repository.find({
      where: where,
      relations: {
        tags: false,
      },
    });
  }

  /**
   * 新增
   */
  async insert(
    info: CustomerCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const time = new Date();
    const entity = plainToInstance(CustomerEntity, {
      ...info,
      createTime: time,
      updateTime: time,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }

  /** 修改 */
  async update(id: number, data: Partial<CustomerUpdateDto>): Promise<number> {
    const info = await this.repository.findOneBy({
      id,
    });
    if (!info) {
      throw ERROR.RESOURCE_NOT_EXITS;
    }
    const entity = plainToInstance(CustomerEntity, {
      ...info,
      ...data,
      updateTime: new Date(),
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
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
