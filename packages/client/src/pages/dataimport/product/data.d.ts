import type { CustomerTag } from '../../customer/tag/data';

export interface ProductListItem {
  id: number;
  productName: string;
  vendorName: string;
  categoryFirstName: string;
  categorySecondName: string;
  categoryThirdName: string;
  tags: CustomerTag[];
}
