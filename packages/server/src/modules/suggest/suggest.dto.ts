import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../dto';
import { SuggestEntity } from './suggest.entity';
import { BaseResult } from 'src/interface/base.interface';

export enum Type {
  cover = 'cover',
  add = 'add',
}
export class SearchDto extends PaginationDto {
  suggestName?: SuggestEntity['suggestName'];
  vendorName?: SuggestEntity['vendorName'];
  categoryFirstName?: SuggestEntity['categoryFirstName'];
  categorySecondName?: SuggestEntity['categorySecondName'];
  categoryThirdName?: SuggestEntity['categoryThirdName'];
}
export class SuggestCreateDto {
  @IsNotEmpty({
    message: '产品型号不能为空',
  })
  suggestName: SuggestEntity['suggestName'];

  @IsNotEmpty({
    message: '品牌不能为空',
  })
  vendorName: SuggestEntity['vendorName'];

  categoryFirstName?: SuggestEntity['categoryFirstName'];

  categorySecondName?: SuggestEntity['categorySecondName'];

  categoryThirdName?: SuggestEntity['categoryThirdName'];

  tags?: SuggestEntity['tags'];
}
export class SuggestUpdateDto extends SuggestCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: SuggestEntity['id'];
}
export class SuggestDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: SuggestEntity['id'][];
}

export class SuggestListResult extends BaseResult {
  data: {
    list: SuggestEntity[];
    total: number;
  };
}

export class SuggestDataResult extends BaseResult {
  data: SuggestEntity[];
}
export class SuggestIdResult extends BaseResult {
  data: number;
}
