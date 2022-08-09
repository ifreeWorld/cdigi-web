import type { TablePagination, CustomerType } from '../../../types/common';
import type { CustomerListItem } from '../list/data';

export interface CustomerTag {
  id: number;
  tagName: string;
  tagColor: string;

  /**
   * 标签类型，客户模型的customerType相关联，即一个标签只能用于同一种类型的客户
   */
  customerType: CustomerType;
  customers: CustomerListItem[];
}

export interface CustomerTagData extends TablePagination {
  list: CustomerTag[];
}
