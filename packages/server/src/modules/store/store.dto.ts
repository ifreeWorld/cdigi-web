import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { StoreEntity } from './store.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  storeName?: StoreEntity['storeName'];
  region?: StoreEntity['region'];
  customerId?: StoreEntity['customer']['id'];
}
export class StoreParseDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
export class StoreCreateDto {
  @IsNotEmpty({
    message: '门店名称不能为空',
  })
  storeName: StoreEntity['storeName'];

  region: StoreEntity['region'];
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

export class StoreDataResult extends BaseResult {
  data: StoreEntity[];
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

export class StoreParseResult extends BaseResult {
  data: string | boolean;
}
