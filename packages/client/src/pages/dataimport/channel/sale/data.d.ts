import { CustomerListItem } from '@/pages/customer/list/data';

export interface SaleItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  storeName: string;
  date: string;
  buyer: CustomerListItem;
  weekStartDate: string;
  weekEndDate: string;
  week: string;
}
