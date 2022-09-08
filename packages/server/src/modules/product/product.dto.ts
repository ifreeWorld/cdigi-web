import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { ProductEntity } from './product.entity';
import { BaseResult } from 'src/interface/base.interface';

export enum Type {
  cover = 'cover',
  add = 'add',
}
export class SearchDto extends PaginationDto {
  productName?: ProductEntity['productName'];
  vendorName?: ProductEntity['vendorName'];
  categoryFirstName?: ProductEntity['categoryFirstName'];
  categorySecondName?: ProductEntity['categorySecondName'];
  categoryThirdName?: ProductEntity['categoryThirdName'];
}

export class ProductParseDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
export class ProductCreateDto {
  @IsNotEmpty({
    message: '产品型号不能为空',
  })
  productName: ProductEntity['productName'];

  @IsNotEmpty({
    message: '品牌不能为空',
  })
  vendorName: ProductEntity['vendorName'];

  categoryFirstName?: ProductEntity['categoryFirstName'];

  categorySecondName?: ProductEntity['categorySecondName'];

  categoryThirdName?: ProductEntity['categoryThirdName'];

  tags?: ProductEntity['tags'];
}
export class ProductUpdateDto extends ProductCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: ProductEntity['id'];
}
export class ProductDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: ProductEntity['id'][];
}

export class ProductListResult extends BaseResult {
  data: {
    list: ProductEntity[];
    total: number;
  };
}

export class ProductDataResult extends BaseResult {
  data: ProductEntity[];
}
export class ProductIdResult extends BaseResult {
  data: number;
}
export class ProductInnerParseResult {
  data: ProductEntity[];
  repeatCount: number;
  repeat: string[];
}
export class ProductParseResult extends BaseResult {
  data: string | ProductInnerParseResult;
}

export class ProductSaveDto {
  data: ProductEntity[];

  @IsNotEmpty({
    message: 'type能为空',
  })
  @IsEnum(Type)
  type: Type;
}
