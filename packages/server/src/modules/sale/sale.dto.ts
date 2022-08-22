import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { SaleEntity } from './sale.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export enum Type {
  cover = 'cover',
  add = 'add',
}

export class SearchDto extends PaginationDto {
  week?: SaleEntity['week'];
  weeks?: SaleEntity['week'][];
  customerId?: SaleEntity['customer']['id'];
}

export class SaleParseDto {
  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  weekStartDate?: string;

  weekEndDate?: string;

  week?: SaleEntity['week'];

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
export class SaleSaveDto {
  data: SaleEntity[];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  @IsNotEmpty({
    message: 'type能为空',
  })
  @IsEnum(Type)
  type: Type;
}

export class SaleDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  weeks: SaleEntity['week'][];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];
}

export class SaleListResult extends BaseResult {
  data: {
    list: SaleEntity[];
    total: number;
  };
}

export class SaleDataResult extends BaseResult {
  data: SaleEntity[];
}

export class SaleInnerParseResult {
  data: SaleEntity[];
  repeatWeekCount: number;
  repeatWeeks: string[];
}
export class SaleParseResult extends BaseResult {
  data: string | SaleInnerParseResult;
}

export class SaleIdResult extends BaseResult {
  data: number;
}

export class SaleBooleanResult extends BaseResult {
  data: boolean;
}
