import { IsNotEmpty, IsEnum } from 'class-validator';
import { PaginationDto } from '../../dto';
import { TagEntity } from './tag.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  tagName?: TagEntity['tagName'];
  customerType?: TagEntity['customerType'];
}
export class CreateDto {
  @IsNotEmpty({
    message: '标签名称不能为空',
  })
  tagName: TagEntity['tagName'];

  @IsNotEmpty({
    message: '标签名称不能为空',
  })
  tagColor: TagEntity['tagColor'];

  @IsNotEmpty({
    message: '修复方案不能为空',
  })
  customerType: TagEntity['customerType'];
}
export class UpdateDto extends CreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: TagEntity['id'];
}

export class ListResult extends BaseResult {
  data: {
    list: TagEntity[];
    total: number;
  };
}
export class TagIdResult extends BaseResult {
  data: number;
}
