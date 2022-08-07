import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { StoreEntity } from './store.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  storeName?: StoreEntity['storeName'];
  customer?: {
    id: StoreEntity['customer']['id'];
  };
}
export class StoreCreateDto {
  @IsNotEmpty({
    message: '门店名称不能为空',
  })
  storeName: StoreEntity['storeName'];

  storeAddress: StoreEntity['storeAddress'];

  @IsNotEmpty({
    message: '所属经销商不能为空',
  })
  customer: {
    id: StoreEntity['customer']['id'];
  };
}
export class StoreUpdateDto extends StoreCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: StoreEntity['id'];
}
export class StoreDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: StoreEntity['id'][];
}

export class StoreListResult extends BaseResult {
  data: {
    list: StoreEntity[];
    total: number;
  };
}
export class StoreIdResult extends BaseResult {
  data: number;
}
