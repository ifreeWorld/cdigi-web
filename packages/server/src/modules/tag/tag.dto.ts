import { IsNotEmpty, IsEnum } from 'class-validator';
import { PaginationDto } from '../../dto';
import { TagEntity } from './tag.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  tagName?: TagEntity['tagName'];
}

export class TagSearchAllDto {}
export class TagCreateDto {
  @IsNotEmpty({
    message: '标签名称不能为空',
  })
  tagName: TagEntity['tagName'];

  @IsNotEmpty({
    message: '标签名称不能为空',
  })
  tagColor: TagEntity['tagColor'];
}
export class TagUpdateDto extends TagCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: TagEntity['id'];
}
export class TagDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: TagEntity['id'][];
}

export class TagListResult extends BaseResult {
  data: {
    list: TagEntity[];
    total: number;
  };
}

export class TagDataResult extends BaseResult {
  data: TagEntity[];
}
export class TagIdResult extends BaseResult {
  data: number;
}
