import type { CustomerListItem } from '../list/data';

export interface CustomerRelation {
  nodes: CustomerListItem[];
  edges: {
    source: number;
    target: number;
  }[];
}
