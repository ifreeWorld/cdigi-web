import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { StockEntity } from './stock.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  week?: StockEntity['week'];
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
  ids: StockEntity['id'][];
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
export class StockIdResult extends BaseResult {
  data: number;
}