import type { CustomerTag } from '../tag/data';
import type { CustomerType } from '../../../types/common';

export interface CustomerListItem {
  id: number;
  customerName: string;
  customerType: CustomerType;
  country: string;
  region: string;
  email: string;
  tags: CustomerTag[];
  parent: CustomerListItem[];
  children: CustomerListItem[];
}
