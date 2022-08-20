import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { StockEntity } from './stock.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  week?: StockEntity['week'];
  customerId?: StockEntity['customer']['id'];
}

export class StockParseDto {
  @IsNotEmpty({
    message: 'weekStartDate不能为空',
  })
  weekStartDate: StockEntity['weekStartDate'];

  @IsNotEmpty({
    message: 'weekEndDate不能为空',
  })
  weekEndDate: StockEntity['weekEndDate'];

  @IsNotEmpty({
    message: 'week不能为空',
  })
  week: StockEntity['week'];

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
// export class StockCreateDto {
//   @IsNotEmpty({
//     message: '产品型号不能为空',
//   })
//   productName: StockEntity['productName'];

//   @IsNotEmpty({
//     message: '品牌不能为空',
//   })
//   vendorName: StockEntity['vendorName'];

//   @IsNotEmpty({
//     message: '一级分类不能为空',
//   })
//   categoryFirstName: StockEntity['categoryFirstName'];

//   categorySecondName?: StockEntity['categorySecondName'];

//   categoryThirdName?: StockEntity['categoryThirdName'];

//   tags?: StockEntity['tags'];
// }
// export class StockUpdateDto extends StockCreateDto {
//   @IsNotEmpty({
//     message: 'id不能为空',
//   })
//   id: StockEntity['id'];
// }
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
export class StockParseResult extends BaseResult {
  data: string | boolean;
}

export class StockIdResult extends BaseResult {
  data: number;
}

export class StockBooleanResult extends BaseResult {
  data: boolean;
}
