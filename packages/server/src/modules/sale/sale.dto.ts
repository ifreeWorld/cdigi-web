import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { SaleEntity } from './sale.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  week?: SaleEntity['week'];
  customerId?: SaleEntity['customer']['id'];
}

export class SaleParseDto {
  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: CustomerEntity['id'];

  weekStartDate?: SaleEntity['weekStartDate'];

  weekEndDate?: SaleEntity['weekEndDate'];

  week?: SaleEntity['week'];

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
// export class SaleCreateDto {
//   @IsNotEmpty({
//     message: '产品型号不能为空',
//   })
//   productName: SaleEntity['productName'];

//   @IsNotEmpty({
//     message: '品牌不能为空',
//   })
//   vendorName: SaleEntity['vendorName'];

//   @IsNotEmpty({
//     message: '一级分类不能为空',
//   })
//   categoryFirstName: SaleEntity['categoryFirstName'];

//   categorySecondName?: SaleEntity['categorySecondName'];

//   categoryThirdName?: SaleEntity['categoryThirdName'];

//   tags?: SaleEntity['tags'];
// }
// export class SaleUpdateDto extends SaleCreateDto {
//   @IsNotEmpty({
//     message: 'id不能为空',
//   })
//   id: SaleEntity['id'];
// }
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
export class SaleParseResult extends BaseResult {
  data: string | boolean;
}

export class SaleIdResult extends BaseResult {
  data: number;
}

export class SaleBooleanResult extends BaseResult {
  data: boolean;
}
