import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { TransitEntity } from './transit.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  inTimeStart?: TransitEntity['inTime'];
  inTimeEnd?: TransitEntity['inTime'];
  customerId?: TransitEntity['customer']['id'];
}

export class TransitParseDto {
  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
export class TransitUpdateDto {
  @IsNotEmpty({
    message: 'inTime不能为空',
  })
  inTime: TransitEntity['inTime'];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  warehousingDate?: TransitEntity['warehousingDate'];

  eta?: TransitEntity['eta'];
}
export class TransitDeleteDto {
  @IsNotEmpty({
    message: 'inTime不能为空',
  })
  inTimes: TransitEntity['inTime'][];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];
}

export class TransitListResult extends BaseResult {
  data: {
    list: TransitEntity[];
    total: number;
  };
}

export class TransitDataResult extends BaseResult {
  data: TransitEntity[];
}
export class TransitParseResult extends BaseResult {
  data: string | boolean;
}

export class TransitIdResult extends BaseResult {
  data: number;
}

export class TransitBooleanResult extends BaseResult {
  data: boolean;
}
