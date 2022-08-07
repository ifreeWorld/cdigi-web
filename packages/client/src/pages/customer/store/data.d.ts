import type { CustomerListItem } from '../list/data.d';

export interface StoreListItem {
  id: number;
  storeName: string;
  storeAddress: string;
  customer: CustomerListItem;
}
