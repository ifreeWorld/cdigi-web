export interface WeeklyData {
  reportName: string;
  productNames: string;
  reportType: number;
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
