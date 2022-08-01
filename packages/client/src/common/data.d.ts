/**
 *  vendor 品牌商
 *  disty 代理商
 *  dealer 经销商
 */
export enum CustomerType {
  vendor = 'vendor',
  disty = 'disty',
  dealer = 'dealer',
}

export interface TablePagination {
  total: number;
  pageSize: number;
  current: number;
}
