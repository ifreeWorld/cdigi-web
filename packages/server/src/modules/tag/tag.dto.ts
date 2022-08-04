import { PaginationDto } from '../../dto';
import { TagEntity } from './tag.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  tagName?: TagEntity['tagName'];
  customerType?: TagEntity['customerType'];
}

export class ListResult extends BaseResult {
  data: {
    list: TagEntity[];
    total: number;
  };
}
