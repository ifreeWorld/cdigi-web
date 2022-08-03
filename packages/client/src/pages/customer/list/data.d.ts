import type { CustomerType, TablePagination } from '../../../common/data';

export interface CustomerListItem {
  id: number;
  customerName: string;
  customerType: CustomerType;
  country: string;
  region: string;
  email: string;
  tags: CustomerTag[];
}

export interface CustomerListData extends TablePagination {
  list: CustomerListItem[];
}
