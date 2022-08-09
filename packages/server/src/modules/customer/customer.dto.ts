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
export class CustomerIdDto {
  @IsNotEmpty({
    message: '用户id不能为空',
  })
  id: CustomerEntity['id'];
}
export class CustomerCreateDto {
  @IsNotEmpty({
    message: '用户名称不能为空',
  })
  customerName: CustomerEntity['customerName'];

  @IsNotEmpty({
    message: '用户类型不能为空',
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
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: CustomerEntity['id'][];
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
