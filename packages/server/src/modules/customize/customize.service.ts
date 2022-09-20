import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import * as validator from 'class-validator';
import { CustomizeEntity } from './customize.entity';
import {
  SearchDto,
  CustomizeCreateDto,
  CustomizeUpdateDto,
  SaleWideTable,
  StockWideTable,
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

  async getPivotData(pivot: CustomizeEntity['pivot'], creatorId: number) {
    appLogger.log(
      `getPivotData input; creatorId: ${creatorId}; pivot: ${JSON.stringify(
        pivot,
      )}`,
    );
    const { type, filter, row, column, value } = pivot;
    const wideSql = await this.getWideSql(type, creatorId);
    const qb = this.dataSource
      .createQueryBuilder()
      .select()
      .from('(' + wideSql + ')', 't');

    // 筛选
    filter.forEach((item) => {
      const { field, op, value } = item;
      // 当前只支持in
      if (op === 'in') {
        qb.where(`${field} IN (:...value)`, { value });
      }
    });
    appLogger.log(
      `getPivotData generate sql; creatorId: ${creatorId}; sql: ${qb.getSql()}`,
    );
    const data = await qb.getRawMany();
    return data;
  }

  /**
   * 拼接大宽表
   */
  async getWideSql(type: 'sale' | 'stock', creatorId: number): Promise<string> {
    if (type === 'sale') {
      return `
        SELECT
          a.*,
          SUBSTRING_INDEX( a.WEEK, '-', 1 ) AS year,
          SUBSTRING_INDEX( a.WEEK, '-', - 1 ) AS weekstr,
          b.vendor_name AS vendorName,
          b.category_first_name AS categoryFirstName,
          b.category_second_name AS categorySecondName,
          b.category_third_name AS categoryThirdName 
        FROM
          (
          SELECT
            s.*,
            c.customer_name AS customerName,
            c.email,
            c.country,
            c.region,
            c.customer_type AS customerType 
          FROM
            (
            SELECT
              sale.id,
              sale.creator_id AS creatorId,
              sale.create_time AS createTime,
              sale.update_time AS updateTime,
              sale.week_start_date AS weekStartDate,
              sale.week_end_date AS weekEndDate,
              sale.week,
              sale.customer_id as customerId,
              sale.product_id as productId,
              sale.product_name as productName,
              sale.quantity,
              sale.price,
              sale.total,
              sale.store_id as storeId,
              sale.store_name as storeName,
              sale.date,
              sale.buyer_id AS buyerId,
              sale.buyer_name AS buyerName,
              buy.customer_type AS buyerCustomerType
            FROM
              tbl_sale sale
              LEFT JOIN tbl_customer buy ON sale.buyer_id = buy.id where sale.creator_id = ${creatorId}
            ) s
            LEFT JOIN tbl_customer c ON s.customerId = c.id
          ) a
          LEFT JOIN tbl_product b ON a.productId = b.id
        `;
    } else if (type === 'stock') {
      return `
        SELECT
          a.*,
          SUBSTRING_INDEX( a.WEEK, '-', 1 ) AS year,
          SUBSTRING_INDEX( a.WEEK, '-', - 1 ) AS weekstr,
          b.vendor_name AS vendorName,
          b.category_first_name AS categoryFirstName,
          b.category_second_name AS categorySecondName,
          b.category_third_name AS categoryThirdName 
        FROM
          (
          SELECT
            s.*,
            c.customer_name AS customerName,
            c.email,
            c.country,
            c.region,
            c.customer_type AS customerType 
          FROM
            (
            SELECT
              stock.id,
              stock.creator_id AS creatorId,
              stock.create_time AS createTime,
              stock.update_time AS updateTime,
              stock.week_start_date AS weekStartDate,
              stock.week_end_date AS weekEndDate,
              stock.week,
              stock.customer_id as customerId,
              stock.product_id as productId,
              stock.product_name as productName,
              stock.quantity,
              stock.price,
              stock.total,
              stock.store_id as storeId,
              stock.store_name as storeName,
              stock.date
            FROM
              tbl_stock stock where stock.creator_id = ${creatorId}
            ) s
            LEFT JOIN tbl_customer c ON s.customerId = c.id
          ) a
          LEFT JOIN tbl_product b ON a.productId = b.id
      `;
    }
    return '';
  }

  /**
   * 新增
   */
  async insert(
    info: CustomizeCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
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
