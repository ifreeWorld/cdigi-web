import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../dto';
import { ReportEntity } from './report.entity';
import { BaseResult } from 'src/interface/base.interface';
import { CustomerType } from '../tag/customerType.enum';
import { SaleEntity } from '../sale/sale.entity';

export enum Type {
  cover = 'cover',
  add = 'add',
}
export class SearchDto extends PaginationDto {
  @IsNotEmpty({
    message: 'date不能为空',
  })
  date: string;

  @IsNotEmpty({
    message: '报告类型不能为空',
  })
  reportType: ReportEntity['reportType'];

  reportName?: ReportEntity['reportName'];

  summary?: boolean;
}
export class SummaryDto {
  @IsNotEmpty({
    message: 'date不能为空',
  })
  date: string;

  @IsNotEmpty({
    message: 'productNames不能为空',
  })
  productNames: ReportEntity['productNames'];

  @IsNotEmpty({
    message: '报告类型不能为空',
  })
  reportType: ReportEntity['reportType'];
}
export class DetailDto extends SummaryDto {
  customerId?: SaleEntity['customer']['id'];

  customerType?: SaleEntity['customer']['customerType'];
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
export class ReportDeleteByReportNameDto {
  @IsNotEmpty({
    message: 'reportName不能为空',
  })
  reportName: ReportEntity['reportName'];
}

export class ReportSummaryRatio {
  startDate: string;
  endDate: string;
  date: string;
  // 销售环比
  saleRingRatio?: Record<CustomerType, number>;
  // 库存周转天数
  stockTurn?: Record<CustomerType, number>;
  // 销量
  saleNum?: Record<CustomerType, number>;
  // 库存量
  stockNum?: Record<CustomerType, number>;
}
export class ReportListResult extends BaseResult {
  data: {
    list: ReportEntity[];
    total: number;
  };
}

export class ReportDataResult extends BaseResult {
  data: (ReportEntity & ReportSummaryRatio)[];
}
export class ReportIdResult extends BaseResult {
  data: number;
}

type ReportNum = number | 'n/a';

export class SaleRatioItem {
  productName: string;
  ringRatio: ReportNum;
  sameRatio: ReportNum;
  avgRatio: ReportNum;
}
export class StockRatioItem {
  productName: string;
  ringRatio: ReportNum;
  sameRatio: ReportNum;
  turn: ReportNum;
}

export class WeeklyDetailData {
  saleNumArr: (Record<string, number> & { productName: string })[];
  saleRatioArr: SaleRatioItem[];
  curWeekSaleTotal: number;
  curWeekSaleRingRatio: ReportNum;
  stockNumArr: (Record<string, number> & { productName: string })[];
  stockRatioArr: StockRatioItem[];
  curWeekStockTotal: number;
  curWeekStockTurn: ReportNum;
}

export class ReportDetailResult extends BaseResult {
  data: WeeklyDetailData;
}
