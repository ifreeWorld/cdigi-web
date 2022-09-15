import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { CustomizeEntity } from './customize.entity';
import {
  SearchDto,
  CustomizeCreateDto,
  CustomizeUpdateDto,
} from './customize.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike, lowerCase, setCreatorWhere, trim } from '../../utils';
import { CustomerService } from '../customer/customer.service';
import { appLogger } from 'src/logger';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomizeService {
  constructor(
    @InjectRepository(CustomizeEntity)
    private repository: Repository<CustomizeEntity>,
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
  ): Promise<[CustomizeEntity[], number]> {
    const where: FindOptionsWhere<CustomizeEntity> = {};
    const { customizeName } = query;
    if (validator.isNotEmpty(customizeName)) {
      where.customizeName = indexOfLike(customizeName);
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
    });
  }

  /**
   * 全量查询
   */
  async findAll(
    query: SearchDto & {
      creatorId: number;
    },
  ): Promise<CustomizeEntity[]> {
    const where: FindOptionsWhere<CustomizeEntity> = {};
    const { customizeName, creatorId } = query;
    if (validator.isNotEmpty(customizeName)) {
      where.customizeName = indexOfLike(customizeName);
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
    });
  }

  /**
   * 新增
   */
  async insert(
    info: CustomizeCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    // const res = await this.repository
    //   .createQueryBuilder('tbl_customize')
    //   .insert()
    //   .into(CustomizeEntity)
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

  /** 修改 */
  async update(id: number, data: Partial<CustomizeUpdateDto>): Promise<number> {
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
