import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../dto';
import { CustomerEntity } from './customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  customerName?: CustomerEntity['customerName'];
  customerType?: CustomerEntity['customerType'];

  @Transform(({ value }) => !!value)
  parent?: boolean;

  @Transform(({ value }) => !!value)
  children?: boolean;
}
export class CustomerAllSearchDto {
  customerType?: CustomerEntity['customerType'];
}
export class CustomerKeyDataDto {
  @IsNotEmpty({
    message: 'key不能为空',
  })
  key: string;
}
export class CustomerIdDto {
  @IsNotEmpty({
    message: '客户id不能为空',
  })
  id: CustomerEntity['id'];
}
export class CustomerCreateDto {
  @IsNotEmpty({
    message: '客户名称不能为空',
  })
  customerName: CustomerEntity['customerName'];

  @IsNotEmpty({
    message: '渠道层级不能为空',
  })
  customerType: CustomerEntity['customerType'];

  @IsNotEmpty({
    message: '国家不能为空',
  })
  country: CustomerEntity['country'];

  @IsNotEmpty({
    message: '区域不能为空',
  })
  region: CustomerEntity['region'];

  email?: CustomerEntity['email'];
  tags?: CustomerEntity['tags'];
  parent?: CustomerEntity['parent'];
}
export class CustomerUpdateDto extends CustomerCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: CustomerEntity['id'];
}
export class CustomerDeleteDto {
  ids: CustomerEntity['id'][];
}
export class CustomerRelationEdges {
  /**
   * 父节点id  ancestor_id
   */
  source: number;
  /**
   * 子节点id  descendant_id
   */
  target: number;
}

export class CustomerListResult extends BaseResult {
  data: {
    list: CustomerEntity[];
    total: number;
  };
}
export class CustomerDataResult extends BaseResult {
  data: CustomerEntity[];
}
export class CustomerIdResult extends BaseResult {
  data: number;
}

export class CustomerRelationResult extends BaseResult {
  data: {
    nodes: CustomerEntity[];
    edges: CustomerRelationEdges[];
  };
}

export class CustomerKeyDataResult extends BaseResult {
  data: string[];
}
