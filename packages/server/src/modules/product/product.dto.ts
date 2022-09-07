import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { ProductEntity } from './product.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  productName?: ProductEntity['productName'];
  vendorName?: ProductEntity['vendorName'];
  categoryFirstName?: ProductEntity['categoryFirstName'];
  categorySecondName?: ProductEntity['categorySecondName'];
  categoryThirdName?: ProductEntity['categoryThirdName'];
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
