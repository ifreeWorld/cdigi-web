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

export interface CustomerTag {
  id: number;
  tagName: string;
  tagColor: string;

  /**
   * 标签类型，客户模型的customerType相关联，即一个标签只能用于同一种类型的客户
   */
  tagType: CustomerType;
}

export interface CustomerListData extends TablePagination {
  list: TableListItem[];
}
