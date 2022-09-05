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
  CustomerRelationResult,
  CustomerRelationEdges,
} from './customer.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike, setCreatorWhere } from '../../utils';

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
    creatorId: number,
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
    setCreatorWhere(where, creatorId);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
      relations: {
        tags: true,
        parent: query.parent,
        children: query.children,
      },
    });
  }

  /**
   * 全量查询
   */
  async allByKey(creatorId: number, key: string): Promise<string[]> {
    const res = await this.dataSource
      .getRepository(CustomerEntity)
      .createQueryBuilder('customer')
      .select(key)
      .distinct(true)
      .getRawMany();

    return res.map((item) => item[key]);
  }

  /**
   * 全量查询
   */
  async findAll(
    creatorId: number,
    customerType?: CustomerEntity['customerType'],
  ): Promise<CustomerEntity[]> {
    const where: FindOptionsWhere<CustomerEntity> = {};
    if (validator.isNotEmpty(customerType)) {
      where.customerType = customerType;
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
      relations: {
        tags: false,
        parent: false,
        children: false,
      },
    });
  }

  /**
   * 查询所有的儿子节点
   * @param id 节点id
   * @returns 查询所有的儿子节点 CustomerEntity[]
   */
  async findAllChildrenByNodeId(
    id: CustomerEntity['id'],
  ): Promise<CustomerEntity[]> {
    const childrens: CustomerEntity[] = [];
    const res = await this.loop(id, childrens);
    return res;
  }

  /**
   * 递归
   * @param id 节点id
   * @param result 临时变量
   * @returns 查询所有的儿子节点 CustomerEntity[]
   */
  async loop(
    id: CustomerEntity['id'],
    result: CustomerEntity[],
  ): Promise<CustomerEntity[]> {
    const childrens = await this.findChildrenByNodeId(id);
    if (childrens.length > 0) {
      for (let i = 0; i < childrens.length; i++) {
        const children = childrens[i];
        if (result.every((item) => item.id !== children.id)) {
          result.push(children);
          await this.loop(children.id, result);
        }
      }
    }
    return result;
  }

  /**
   * 全量查询
   */
  async findChildrenByNodeId(
    id: CustomerEntity['id'],
  ): Promise<CustomerEntity[]> {
    const res = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        tags: false,
        children: true,
      },
    });
    return res.children;
  }

  /**
   * 查询关系图数据
   */
  async findRelations(
    creatorId: number,
  ): Promise<CustomerRelationResult['data']> {
    const nodes = await this.findAll(creatorId);
    // TODO 测试下是否需要在这里做creatorId的过滤
    const edges: CustomerRelationEdges[] = await this.dataSource.manager.query(
      'select ancestor_id as source, descendant_id as target from tbl_customer_closure',
    );
    return {
      nodes,
      edges,
    };
  }

  /**
   * 新增
   */
  async insert(
    info: CustomerCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const entity = plainToInstance(CustomerEntity, {
      ...info,
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
