import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import * as validator from 'class-validator';
import { CustomizeEntity } from './customize.entity';
import {
  SearchDto,
  CustomizeCreateDto,
  CustomizeUpdateDto,
  SaleAndStockDto,
  UploadSummaryDto,
} from './customize.dto';
import { CustomResponse, ERROR } from 'src/constant/error';
import { getMonthAndWeekText, indexOfLike, setCreatorWhere } from '../../utils';
import { CustomerService } from '../customer/customer.service';
import { appLogger } from 'src/logger';
import { setFilterQb } from './util';
import {
  getMonthText,
  getMonthWeekText,
  getQuarterText,
  getWeekaloneText,
  getYearText,
} from '../../utils';
import { ProductEntity } from '../product/product.entity';
import { CustomerType } from '../tag/customerType.enum';
import { StoreService } from '../store/store.service';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';
import { CustomerEntity } from '../customer/customer.entity';
import * as moment from 'moment';
import { ConfigService } from '../config/config.service';
import { TransitEntity } from '../transit/transit.entity';
import { dateFormat } from 'src/constant/file';
import { customerTypeMap } from 'src/constant/map';
import { isEmpty } from 'class-validator';

const timeFields = ['year', 'quarter', 'month', 'monthAndWeek', 'weekalone'];
const allFieldText = '全部';

@Injectable()
export class CustomizeService {
  constructor(
    @InjectRepository(CustomizeEntity)
    private repository: Repository<CustomizeEntity>,
    @InjectRepository(SaleEntity)
    private saleRepository: Repository<SaleEntity>,
    @InjectRepository(StockEntity)
    private stockRepository: Repository<StockEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    private customerService: CustomerService,
    private storeService: StoreService,
    private dataSource: DataSource,
    private configService: ConfigService,
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
    // if (row.field === 'monthWeek') {
    //   qb.addSelect('t.month');
    // }

    let finalColumns;

    if (!validator.isEmpty(column) && !validator.isEmpty(value)) {
      const { filter: columnFilter = { value: [] }, field: columnField } =
        column;
      const { value: filterValue } = columnFilter;
      const { field: valueField, aggregator } = value;
      if (!aggregator) {
        throw new CustomResponse('请先选择值的聚合类型');
      }
      // 用户选择了列的filter，就拼接CASE WHEN
      if (filterValue && filterValue.length > 0) {
        finalColumns = filterValue;
        filterValue.forEach((v) => {
          let alias = v;
          if (['customerType', 'buyerCustomerType'].includes(columnField)) {
            alias = customerTypeMap[v];
          }
          qb.addSelect(
            `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${v}' THEN t.${valueField} END ),0)`,
            alias,
          );
        });
        let inTxt = '';
        filterValue.forEach((v, index) => {
          inTxt += `'${v}'`;
          if (index !== filterValue.length - 1) {
            inTxt += ',';
          }
        });
        qb.addSelect(
          `IFNULL(${aggregator}( CASE WHEN t.${columnField} in (${inTxt}) THEN t.${valueField} END ),0)`,
          allFieldText,
        );
      } else {
        // 用户没选择，就先查询数据库中column field的所有的选项
        const data = await this.getAllValues(columnField, type, creatorId);
        finalColumns = data.map((item) => item.value);
        data.forEach((item) => {
          let alias = item.value;
          if (['customerType', 'buyerCustomerType'].includes(columnField)) {
            alias = customerTypeMap[item.value];
          }
          qb.addSelect(
            `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${item.value}' THEN t.${valueField} END ),0)`,
            alias,
          );
        });
        qb.addSelect(
          `IFNULL(${aggregator}( t.${valueField} ),0)`,
          allFieldText,
        );
      }
    }

    qb.from('(' + wideSql + ')', 't');
    // group by
    qb.groupBy(`t.${row.field}`);
    // if (row.field === 'monthWeek') {
    //   qb.groupBy('t.month');
    //   qb.addGroupBy(`t.${row.field}`);
    // } else {
    //   qb.groupBy(`t.${row.field}`);
    // }
    // // order by
    // if (row.field === 'monthWeek') {
    //   qb.orderBy('t.month');
    //   qb.addOrderBy(`t.${row.field}`);
    // } else {
    //   qb.orderBy(`t.${row.field}`);
    // }
    qb.orderBy(`t.${row.field}`);
    // 筛选
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

    let data = await qb.getRawMany();
    let sort = [row.field, ...finalColumns, allFieldText];
    // @ts-ignore
    if (timeFields.includes(row.field)) {
      // 行为时间字段时，需要进行format
      data = data.map((item) => {
        for (const key in item) {
          if (key !== row.field) {
            item[key] = Number(item[key]);
          }
          // 设置format
          if (key === 'year') {
            item[key] = getYearText(item[key]);
          }
          // 设置format
          if (key === 'month') {
            item[key] = getMonthText(item[key]);
          }
          // 设置format
          if (key === 'quarter') {
            item[key] = getQuarterText(item[key]);
          }
          // 设置format
          if (key === 'weekalone') {
            item[key] = getWeekaloneText(item[key]);
          }
          // 设置format
          if (key === 'monthAndWeek') {
            item[key] = getMonthAndWeekText(item[key]);
            delete item.month;
          }
        }
        return item;
      });
      // @ts-ignore
    } else if (timeFields.includes(column.field)) {
      if (column.field === 'year') {
        data = data.map((item) => {
          for (const key in item) {
            // 设置format
            if (key !== row.field && key !== allFieldText) {
              const newKey = getYearText(key);
              sort = sort.map((s) => (s === Number(key) ? newKey : s));
              item[newKey] = Number(item[key]);
              delete item[key];
            }
            if (key === allFieldText) {
              item[key] = Number(item[key]);
            }
          }
          return item;
        });
      }
      if (column.field === 'month') {
        data = data.map((item) => {
          for (const key in item) {
            // 设置format
            if (key !== row.field && key !== allFieldText) {
              const newKey = getMonthText(key);
              sort = sort.map((s) => (s === Number(key) ? newKey : s));
              item[newKey] = Number(item[key]);
              delete item[key];
            }
            if (key === allFieldText) {
              item[key] = Number(item[key]);
            }
          }
          return item;
        });
      }
      if (column.field === 'quarter') {
        data = data.map((item) => {
          for (const key in item) {
            // 设置format
            if (key !== row.field && key !== allFieldText) {
              const newKey = getQuarterText(key);
              sort = sort.map((s) => (s === Number(key) ? newKey : s));
              item[newKey] = Number(item[key]);
              delete item[key];
            }
            if (key === allFieldText) {
              item[key] = Number(item[key]);
            }
          }
          return item;
        });
      }
      if (column.field === 'weekalone') {
        data = data.map((item) => {
          for (const key in item) {
            // 设置format
            if (key !== row.field && key !== allFieldText) {
              const newKey = getWeekaloneText(key);
              sort = sort.map((s) => (s === Number(key) ? newKey : s));
              item[newKey] = Number(item[key]);
              delete item[key];
            }
            if (key === allFieldText) {
              item[key] = Number(item[key]);
            }
          }
          return item;
        });
      }
      if (column.field === 'monthAndWeek') {
        data = data.map((item) => {
          for (const key in item) {
            // 设置format
            if (key !== row.field && key !== allFieldText) {
              const newKey = getMonthAndWeekText(key);
              sort = sort.map((s) => (s === Number(key) ? newKey : s));
              item[newKey] = Number(item[key]);
              delete item[key];
            }
            if (key === allFieldText) {
              item[key] = Number(item[key]);
            }
          }
          return item;
        });
      }
    }
    return {
      list: data,
      row: row.field,
      column: column.field,
      value: value.field,
      sort,
    };
  }

  /**
   * 拼接大宽表
   */
  async getWideSql(type: 'sale' | 'stock', creatorId: number): Promise<string> {
    if (type === 'sale') {
      return `
        SELECT
          a.*,
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
              sale.year,
              sale.month,
              sale.quarter,
              sale.month_week as monthWeek,
              concat(LPAD(sale.month, 2, 0),sale.month_week) AS monthAndWeek,
              sale.weekalone,
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
              buy.customer_type AS buyerCustomerType,
              buy.region AS buyerRegion,
              buy.country AS buyerCountry
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
              stock.year,
              stock.month,
              stock.quarter,
              stock.month_week as monthWeek,
              concat(LPAD(stock.month, 2, 0),stock.month_week) AS monthAndWeek,
              stock.weekalone,
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
      month: {
        field: 'month',
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
      country: {
        field: 'country',
        entity: CustomerEntity,
      },
      region: {
        field: 'region',
        entity: CustomerEntity,
      },
      buyerCountry: {
        field: 'country',
        entity: CustomerEntity,
      },
      buyerRegion: {
        field: 'region',
        entity: CustomerEntity,
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
        .orderBy('value', 'ASC')
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
      // 1.客户，需要带上渠道层级
      if (field === 'customerName') {
        const res = await this.customerService.findAll(creatorId);
        return res.map((item) => ({
          value: item.customerName,
          label: item.customerName,
          customerType: item.customerType,
        }));
      }
      // 2.采购客户，需要带上渠道层级
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
          value: item.customerName,
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
          value: item.storeName,
          label: item.storeName,
          customerId: item.customer?.id || -1,
          customerName: item.customer?.customerName || '',
        }));
      }
      // 4.monthAndWeek
      if (field === 'monthAndWeek') {
        const res = await this.dataSource
          .getRepository(type === 'sale' ? SaleEntity : StockEntity)
          .createQueryBuilder()
          .select(`concat(LPAD(month, 2, 0),month_week)`, 'value')
          .distinct(true)
          .where('creator_id = :creatorId', { creatorId })
          .orderBy('value', 'ASC')
          .getRawMany();
        return res
          .filter((item) => item.value)
          .map((item) => ({
            value: item.value,
            label: item.value,
          }));
      }
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

  /**
   * 获取销售库存数据
   * @param ids
   */
  async saleAndStock(body: SaleAndStockDto, creatorId: number) {
    const { startWeek, endWeek, customerId } = body;
    let productNames = body.productNames;
    // 销售
    const saleWhere: FindOptionsWhere<SaleEntity> = {};
    if (validator.isNotEmpty(customerId)) {
      saleWhere.customer = {
        id: customerId,
      };
    }
    if (validator.isNotEmpty(productNames)) {
      saleWhere.productName = In(productNames);
    }
    if (validator.isNotEmpty(startWeek)) {
      saleWhere.week = MoreThanOrEqual(startWeek);
    }
    if (validator.isNotEmpty(endWeek)) {
      saleWhere.week = LessThanOrEqual(endWeek);
    }
    setCreatorWhere(saleWhere, creatorId);
    const saleData = await this.saleRepository.find({
      where: saleWhere,
    });

    // 库存
    const stockWhere: FindOptionsWhere<SaleEntity> = {};
    if (validator.isNotEmpty(customerId)) {
      stockWhere.customer = {
        id: customerId,
      };
    }
    if (validator.isNotEmpty(productNames)) {
      stockWhere.productName = In(productNames);
    }
    if (validator.isNotEmpty(startWeek)) {
      stockWhere.week = MoreThanOrEqual(startWeek);
    }
    if (validator.isNotEmpty(endWeek)) {
      stockWhere.week = LessThanOrEqual(endWeek);
    }
    setCreatorWhere(stockWhere, creatorId);
    const stockData = await this.stockRepository.find({
      where: stockWhere,
    });

    // 在途库存
    const qb = this.dataSource
      .getRepository(TransitEntity)
      .createQueryBuilder('transit')
      .select('eta')
      .addSelect('product_name', 'productName')
      .addSelect('sum(`quantity`)', 'quantity')
      .where('warehousing_date is null');
    if (validator.isNotEmpty(customerId)) {
      qb.andWhere('customer_id = :customerId', { customerId });
    }
    if (validator.isNotEmpty(productNames)) {
      qb.andWhere('product_name IN (:...productNames)', { productNames });
    }
    qb.andWhere(`creator_id = :creatorId`, { creatorId })
      .groupBy('eta')
      .addGroupBy('product_name')
      .orderBy('eta', 'DESC');
    const transitData = await qb.getRawMany();
    const etas = transitData.map((item) => item.eta);

    // 查询周开始日
    let weekStartIndex = '1';
    weekStartIndex = await this.configService.hget(
      'getWeekStartIndex',
      String(creatorId),
    );
    if (!weekStartIndex) {
      weekStartIndex = '1';
    }
    moment.locale('zh-cn', {
      week: {
        dow: Number(weekStartIndex),
      },
    });

    const result = [];
    const weekArr = this.getWeekArr(startWeek, endWeek);

    // 如果没传productNames，就查询所有的productNames
    if (!productNames || productNames.length === 0) {
      const res = await this.getAllValues('productName', 'sale', creatorId);
      productNames = res.map((item) => item.value);
    }
    productNames.forEach((productName) => {
      const temp = {
        productName,
        transit: {},
      };
      if (etas.length > 0) {
        etas.forEach((eta) => {
          const transit =
            transitData.find(
              (item) => item.eta === eta && item.productName === productName,
            ) || {};
          const k = eta ? moment(eta).format(dateFormat) : '';
          // @ts-ignore
          temp.transit[k] = transit.quantity || 0;
        });
      }
      weekArr.forEach((week) => {
        const sale =
          saleData.find(
            (item) => item.week === week && item.productName === productName,
          )?.quantity || 0;
        const stock =
          stockData.find(
            (item) => item.week === week && item.productName === productName,
          )?.quantity || 0;
        if (!temp[week]) {
          temp[week] = {};
        }
        temp[week].sale = sale;
        temp[week].stock = stock;
      });
      result.push(temp);
    });
    return result;
  }

  getWeekArr(start: string, end: string) {
    let year = Number(start.split('-')[0]);
    let weekalone = Number(start.split('-')[1]);
    const startWeek = moment().year(year).week(weekalone);
    year = Number(end.split('-')[0]);
    weekalone = Number(end.split('-')[1]);
    const endWeek = moment().year(year).week(weekalone);

    const diff = endWeek.diff(startWeek, 'weeks');
    const result = [];
    result.push(end);
    for (let i = 1; i < diff; i++) {
      const temp = endWeek.clone().subtract(i, 'weeks');
      result.push(temp.format('gggg-ww'));
    }
    result.push(start);
    return result;
  }

  async getUploadSummary(
    { week, customerId, customerType }: UploadSummaryDto,
    creatorId: number,
  ) {
    if (isEmpty(customerId)) {
      // 是空的情况下，查询全量的
      const customerData = await this.customerRepository.find({
        where: {
          creatorId,
        },
      });
      const sales = await this.dataSource
        .getRepository(SaleEntity)
        .createQueryBuilder('sale')
        .select('customer_id', 'customerId')
        .distinct(true)
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('week = :week', { week })
        .getRawMany();
      const stocks = await this.dataSource
        .getRepository(StockEntity)
        .createQueryBuilder('stock')
        .select('customer_id', 'customerId')
        .distinct(true)
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('week = :week', { week })
        .getRawMany();
      const saleData = sales.map((item) => item.customerId);
      const stockData = stocks.map((item) => item.customerId);
      const data = [
        {
          key: 'vendor',
          title: '品牌商',
          saleTotal: 0,
          saleNumber: 0,
          stockTotal: 0,
          stockNumber: 0,
          noSaleUpload: [],
          noStockUpload: [],
        },
        {
          key: 'disty',
          title: '代理商',
          saleTotal: 0,
          saleNumber: 0,
          stockTotal: 0,
          stockNumber: 0,
          noSaleUpload: [],
          noStockUpload: [],
        },
        {
          key: 'dealer',
          title: '经销商',
          saleTotal: 0,
          saleNumber: 0,
          stockTotal: 0,
          stockNumber: 0,
          noSaleUpload: [],
          noStockUpload: [],
        },
      ];
      customerData.forEach((item) => {
        const { customerType, id, customerName } = item;
        const index = customerType - 1;
        if (stockData.includes(id)) {
          data[index].stockNumber += 1;
        } else {
          data[index].noStockUpload.push(customerName);
        }
        if (saleData.includes(id)) {
          data[index].saleNumber += 1;
        } else {
          data[index].noSaleUpload.push(customerName);
        }
        data[index].stockTotal += 1;
        data[index].saleTotal += 1;
      });
      return data;
    } else {
      // 非空的情况下，只查询这一个客户的近12周数据
      // 查询周开始日
      let weekStartIndex = '1';
      weekStartIndex = await this.configService.hget(
        'getWeekStartIndex',
        String(creatorId),
      );
      if (!weekStartIndex) {
        weekStartIndex = '1';
      }
      moment.locale('zh-cn', {
        week: {
          dow: Number(weekStartIndex),
        },
      });
      const weeks = [];
      for (let i = 0; i < 12; i++) {
        weeks.push(
          moment(week, 'gggg-ww')
            .subtract(i * 7, 'day')
            .format('gggg-ww'),
        );
      }
      const sales = await this.dataSource
        .getRepository(SaleEntity)
        .createQueryBuilder('sale')
        .select('week')
        .addSelect('count(*)', 'count')
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('customer_id = :customerId', { customerId })
        .andWhere('week IN (:...weeks)', { weeks })
        .groupBy('week')
        .getRawMany();
      const stocks = await this.dataSource
        .getRepository(StockEntity)
        .createQueryBuilder('stock')
        .select('week')
        .addSelect('count(*)', 'count')
        .where('creator_id = :creatorId', { creatorId })
        .andWhere('customer_id = :customerId', { customerId })
        .andWhere('week IN (:...weeks)', { weeks })
        .groupBy('week')
        .getRawMany();
      const result = weeks.map((item) => ({
        week: item,
        sale: sales.some((s) => s.week === item && s.count > 0),
        stock: stocks.some((s) => s.week === item && s.count > 0),
      }));
      return result;
    }
  }
}
