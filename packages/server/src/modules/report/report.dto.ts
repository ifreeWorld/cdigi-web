import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { ReportEntity } from './report.entity';
import { BaseResult } from 'src/interface/base.interface';

export enum Type {
  cover = 'cover',
  add = 'add',
}
export class SearchDto extends PaginationDto {
  @IsNotEmpty({
    message: 'date不能为空',
  })
  date: ReportEntity['date'];

  reportName?: ReportEntity['reportName'];

  @IsNotEmpty({
    message: '报告类型不能为空',
  })
  reportType: ReportEntity['reportType'];
}
export class ReportCreateDto {
  @IsNotEmpty({
    message: '报告名称不能为空',
  })
  reportName: ReportEntity['reportName'];

  @IsNotEmpty({
    message: '报告类型不能为空',
  })
  reportType: ReportEntity['reportType'];

  @IsNotEmpty({
    message: '产品型号不能为空',
  })
  productNames: ReportEntity['productNames'];

  @IsNotEmpty({
    message: 'date不能为空',
  })
  date: ReportEntity['date'];
}
export class ReportUpdateDto extends ReportCreateDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: ReportEntity['id'];
}
export class ReportDeleteDto {
  @IsNotEmpty({
    message: 'ids不能为空',
  })
  ids: ReportEntity['id'][];
}

export class ReportListResult extends BaseResult {
  data: {
    list: ReportEntity[];
    total: number;
  };
}

export class ReportDataResult extends BaseResult {
  data: ReportEntity[];
}
export class ReportIdResult extends BaseResult {
  data: number;
}
