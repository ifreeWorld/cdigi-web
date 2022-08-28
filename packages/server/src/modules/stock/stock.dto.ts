import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { StockEntity } from './stock.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export enum Type {
  cover = 'cover',
  add = 'add',
}
export class SearchDto extends PaginationDto {
  week?: StockEntity['week'];
  weeks?: StockEntity['week'][];
  customerId?: StockEntity['customer']['id'];
}

export class StockParseDto {
  weekStartDate?: StockEntity['weekStartDate'];
  weekEndDate?: StockEntity['weekEndDate'];
  week?: StockEntity['week'];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class StockSaveDto {
  data: StockEntity[];

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

export class StockDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  weeks: StockEntity['week'][];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];
}

export class StockListResult extends BaseResult {
  data: {
    list: StockEntity[];
    total: number;
  };
}

export class StockDataResult extends BaseResult {
  data: StockEntity[];
}

export class StockInnerParseResult {
  data: StockEntity[];
  repeatWeekCount: number;
  repeatWeeks: string[];
}
export class StockParseResult extends BaseResult {
  data: string | StockInnerParseResult;
}

export class StockIdResult extends BaseResult {
  data: number;
}

export class StockBooleanResult extends BaseResult {
  data: boolean;
}
