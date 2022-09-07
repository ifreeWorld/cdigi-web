import type { CustomerListItem } from '../list/data.d';

export interface StoreListItem {
  id: number;
  region: string;
  storeName: string;
  storeAddress: string;
  customer: Partial<CustomerListItem>;
}
