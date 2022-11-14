import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { CustomizeEntity } from './customize.entity';
import { BaseResult } from 'src/interface/base.interface';
import { CustomerType } from '../tag/customerType.enum';
import { CustomerEntity } from '../customer/customer.entity';

export class SearchDto extends PaginationDto {
  customizeName?: CustomizeEntity['customizeName'];
}
export class CustomizePivotDto {
  @IsNotEmpty({
    message: 'type不能为空',
  })
  type: CustomizeEntity['pivot']['type'];

  filter: CustomizeEntity['pivot']['filter'];

  @IsNotEmpty({
    message: '行不能为空',
  })
  row: CustomizeEntity['pivot']['row'];

  @IsNotEmpty({
    message: '列不能为空',
  })
  column: CustomizeEntity['pivot']['column'];

  @IsNotEmpty({
    message: '值不能为空',
  })
  value: CustomizeEntity['pivot']['value'];
}
export class CustomizeValuesDto {
  @IsNotEmpty({
    message: '字段不能为空',
  })
  field: string;
}
export class CustomizeCreateDto {
  @IsNotEmpty({
    message: '自定义名称不能为空',
  })
  customizeName: CustomizeEntity['customizeName'];

  @IsNotEmpty({
    message: '数据透视配置不能为空',
  })
  pivot: CustomizeEntity['pivot'];

  desc?: CustomizeEntity['desc'];
}
export class CustomizeUpdateDto extends CustomizeCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: CustomizeEntity['id'];
}
export class CustomizeDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: CustomizeEntity['id'][];
}

export class CustomizePivotResult extends BaseResult {
  data: {
    list: unknown[];
    row: string;
    column: string;
    value: string;
  };
}
export class CustomizeDataResult extends BaseResult {
  data: CustomizeEntity[];
}

export class CustomizeListResult extends BaseResult {
  data: {
    list: CustomizeEntity[];
    total: number;
  };
}
export class CustomizeIdResult extends BaseResult {
  data: number;
}

export class CustomizeParseResult extends BaseResult {
  data: string | boolean;
}

export class SaleWideTable {
  id: number;
  creatorId: number;
  createTime?: Date;
  updateTime?: Date;
  weekStartDate: Date;
  weekEndDate: Date;
  week: string;
  year: string;
  weekalone: string;
  quarter: string;
  month: string;
  monthWeek: string;
  monthAndWeek: string;
  customerId: number;
  customerName: string;
  customerType: CustomerType;
  country: string;
  region: string;
  email: string;
  productId: number;
  productName: string;
  vendorName: string;
  categoryFirstName?: string;
  categorySecondName?: string;
  categoryThirdName?: string;
  quantity: number;
  price?: number;
  total?: number;
  storeId?: number;
  storeName?: string;
  date?: Date;
  buyerId?: number;
  buyerName?: string;
  buyerCustomerType: CustomerType;
  buyerRegion: string;
  buyerCountry: string;
}

export class StockWideTable {
  id: number;
  creatorId: number;
  createTime?: Date;
  updateTime?: Date;
  weekStartDate: Date;
  weekEndDate: Date;
  week: string;
  year: string;
  weekalone: string;
  quarter: string;
  month: string;
  monthWeek: string;
  monthAndWeek: string;
  customerId: number;
  customerName: string;
  customerType: CustomerType;
  country: string;
  region: string;
  email: string;
  productId: number;
  productName: string;
  vendorName: string;
  categoryFirstName?: string;
  categorySecondName?: string;
  categoryThirdName?: string;
  quantity: number;
  price?: number;
  total?: number;
  storeId?: number;
  storeName?: string;
  date?: Date;
}

export class SaleAndStockDto {
  @IsNotEmpty({
    message: '开始周不能为空',
  })
  startWeek: string;

  @IsNotEmpty({
    message: '结束周不能为空',
  })
  endWeek: string;

  @IsNotEmpty({
    message: '客户id不能为空',
  })
  customerId: CustomerEntity['id'];

  productNames?: string[];
}

export class UploadSummaryDto {
  @IsNotEmpty({
    message: 'week不能为空',
  })
  week: string;

  customerId?: CustomerEntity['id'];

  customerType?: CustomerEntity['customerType'];
}
