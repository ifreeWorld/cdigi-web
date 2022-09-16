import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { CustomizeEntity } from './customize.entity';
import { BaseResult } from 'src/interface/base.interface';

export class SearchDto extends PaginationDto {
  customizeName?: CustomizeEntity['customizeName'];
}
export class CustomizeCreateDto {
  @IsNotEmpty({
    message: '自定义名称不能为空',
  })
  customizeName: CustomizeEntity['customizeName'];

  @IsNotEmpty({
    message: '数据透视配置不能为空',
  })
  pivot: CustomizeEntity['pivot'];

  desc?: CustomizeEntity['desc'];
}
export class CustomizeUpdateDto extends CustomizeCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: CustomizeEntity['id'];
}
export class CustomizeDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: CustomizeEntity['id'][];
}

export class CustomizeDataResult extends BaseResult {
  data: CustomizeEntity[];
}

export class CustomizeListResult extends BaseResult {
  data: {
    list: CustomizeEntity[];
    total: number;
  };
}
export class CustomizeIdResult extends BaseResult {
  data: number;
}

export class CustomizeParseResult extends BaseResult {
  data: string | boolean;
}
