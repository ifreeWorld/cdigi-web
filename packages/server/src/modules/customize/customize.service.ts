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
import { indexOfLike, setCreatorWhere } from '../../utils';
import { CustomerService } from '../customer/customer.service';
import { appLogger } from 'src/logger';
import { setFilterQb } from './util';
import { ProductEntity } from '../product/product.entity';
import { CustomerType } from '../tag/customerType.enum';
import { StoreService } from '../store/store.service';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';

@Injectable()
export class CustomizeService {
  constructor(
    @InjectRepository(CustomizeEntity)
    private repository: Repository<CustomizeEntity>,
    private customerService: CustomerService,
    private storeService: StoreService,
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
    if (
      validator.isEmpty(row) ||
      validator.isEmpty(column) ||
      validator.isEmpty(value)
    ) {
      return;
    }

    const wideSql = await this.getWideSql(type, creatorId);
    const qb = this.dataSource.createQueryBuilder().select(`t.${row.field}`);

    if (!validator.isEmpty(column) && !validator.isEmpty(value)) {
      const { filter: columnFilter = { value: [] }, field: columnField } =
        column;
      const { value: filterValue } = columnFilter;
      const { field: valueField, aggregator } = value;
      // 用户选择了列的filter，就拼接CASE WHEN
      if (filterValue && filterValue.length > 0) {
        filterValue.forEach((v) => {
          qb.addSelect(
            `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${v}' THEN t.${valueField} END ),0)`,
            `${v}`,
          );
        });
      } else {
        // 用户没选择，就先查询数据库中column field的所有的选项
        const data = await this.getAllValues(columnField, type, creatorId);
        data.forEach((item) => {
          qb.addSelect(
            `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${item.value}' THEN t.${valueField} END ),0)`,
            `${item.value}`,
          );
        });
      }
      qb.addSelect(`${aggregator}( t.${valueField} )`, 'all');
    }

    qb.from('(' + wideSql + ')', 't');
    // group by
    qb.groupBy(`t.${row.field}`);
    qb.where('1=1');
    // filter中的筛选
    setFilterQb(qb, filter);
    // 行中的筛选
    setFilterQb(qb, row.filter);
    // 列的筛选
    setFilterQb(qb, column.filter);
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
   * 获取所有值
   * @param field 字段
   */
  async getAllValues(field: string, type: 'sale' | 'stock', creatorId: number) {
    // 规范的字段map
    const field2DataMap = {
      productName: {
        field: 'product_name',
        entity: ProductEntity,
      },
      categoryFirstName: {
        field: 'category_first_name',
        entity: ProductEntity,
      },
      categorySecondName: {
        field: 'category_second_name',
        entity: ProductEntity,
      },
      categoryThirdName: {
        field: 'category_third_name',
        entity: ProductEntity,
      },
      vendorName: {
        field: 'vendor_name',
        entity: ProductEntity,
      },
      year: {
        field: 'year',
        entity: type === 'sale' ? SaleEntity : StockEntity,
      },
      quarter: {
        field: 'quarter',
        entity: type === 'sale' ? SaleEntity : StockEntity,
      },
      monthWeek: {
        field: 'month_week',
        entity: type === 'sale' ? SaleEntity : StockEntity,
      },
      weekalone: {
        field: 'weekalone',
        entity: type === 'sale' ? SaleEntity : StockEntity,
      },
    };
    const data = field2DataMap[field];
    // 规范的直接distinct查询出列表进行展示即可
    if (data) {
      const res = await this.dataSource
        .getRepository(data.entity)
        .createQueryBuilder()
        .select(data.field, 'value')
        .distinct(true)
        .where('creator_id = :creatorId', { creatorId })
        .getRawMany();
      return res
        .filter((item) => item.value)
        .map((item) => ({
          value: item.value,
          label: item.value,
        }));
    } else {
      if (field === 'customerType') {
        return [
          {
            value: CustomerType.vendor,
            label: '品牌商',
          },
          {
            value: CustomerType.disty,
            label: '代理商',
          },
          {
            value: CustomerType.dealer,
            label: '经销商',
          },
        ];
      }
      if (field === 'buyerCustomerType') {
        return [
          {
            value: CustomerType.disty,
            label: '代理商',
          },
          {
            value: CustomerType.dealer,
            label: '经销商',
          },
        ];
      }
      // 定制化字段
      // 1.客户，需要带上客户类型
      if (field === 'customerName') {
        const res = await this.customerService.findAll(creatorId);
        return res.map((item) => ({
          value: item.id,
          label: item.customerName,
          customerType: item.customerType,
        }));
      }
      // 2.采购客户，需要带上客户类型
      if (field === 'buyerName') {
        const disty = await this.customerService.findAll(
          creatorId,
          CustomerType.disty,
        );
        const dealer = await this.customerService.findAll(
          creatorId,
          CustomerType.dealer,
        );
        return [...disty, ...dealer].map((item) => ({
          value: item.id,
          label: item.customerName,
          customerType: item.customerType,
        }));
      }
      // 3.门店，需要带上所属经销商字段
      if (field === 'storeName') {
        const res = await this.storeService.findAll(
          {
            creatorId,
          },
          true,
        );
        return res.map((item) => ({
          value: item.id,
          label: item.storeName,
          customerId: item.customer?.id || -1,
          customerName: item.customer?.customerName || '',
        }));
      }
      // TODO 4.国家&区域
    }
    return [];
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
