import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProductEntity } from './product.entity';
import { SearchDto, ProductCreateDto, ProductUpdateDto } from './product.dto';
import { ERROR } from 'src/constant/error';
import { indexOfLike } from '../../utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repository: Repository<ProductEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[ProductEntity[], number]> {
    const where: FindOptionsWhere<ProductEntity> = {};
    const {
      productName,
      vendorName,
      categoryFirstName,
      categorySecondName,
      categoryThirdName,
    } = query;
    if (validator.isNotEmpty(productName)) {
      where.productName = indexOfLike(productName);
    }
    if (validator.isNotEmpty(vendorName)) {
      where.vendorName = indexOfLike(vendorName);
    }
    if (validator.isNotEmpty(categoryFirstName)) {
      where.categoryFirstName = indexOfLike(categoryFirstName);
    }
    if (validator.isNotEmpty(categorySecondName)) {
      where.categorySecondName = indexOfLike(categorySecondName);
    }
    if (validator.isNotEmpty(categoryThirdName)) {
      where.categoryThirdName = indexOfLike(categoryThirdName);
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
  async findAll(query: SearchDto): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {};
    const {
      productName,
      vendorName,
      categoryFirstName,
      categorySecondName,
      categoryThirdName,
    } = query;
    if (validator.isNotEmpty(productName)) {
      where.productName = indexOfLike(productName);
    }
    if (validator.isNotEmpty(vendorName)) {
      where.vendorName = vendorName;
    }
    if (validator.isNotEmpty(categoryFirstName)) {
      where.categoryFirstName = categoryFirstName;
    }
    if (validator.isNotEmpty(categorySecondName)) {
      where.categorySecondName = categorySecondName;
    }
    if (validator.isNotEmpty(categoryThirdName)) {
      where.categoryThirdName = categoryThirdName;
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
    info: ProductCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const entity = plainToInstance(ProductEntity, {
      ...info,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }

  /** 修改 */
  async update(id: number, data: Partial<ProductUpdateDto>): Promise<number> {
    const info = await this.repository.findOneBy({
      id,
    });
    if (!info) {
      throw ERROR.RESOURCE_NOT_EXITS;
    }
    const entity = plainToInstance(ProductEntity, {
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
