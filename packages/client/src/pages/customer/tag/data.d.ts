import type { TablePagination } from '../../../types/common';
import type { CustomerListItem } from '../list/data';

export interface CustomerTag {
  id: number;
  tagName: string;
  tagColor: string;
  customers: CustomerListItem[];
}

export interface CustomerTagData extends TablePagination {
  list: CustomerTag[];
}
