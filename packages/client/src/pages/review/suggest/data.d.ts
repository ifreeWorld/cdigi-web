export interface Summary {
  key: string;
  title: string;
  saleTotal: number;
  saleNumber: number;
  stockTotal: number;
  stockNumber: number;
  noSaleUpload: string[];
  noStockUpload: string[];
}

export interface SummaryLeaf {
  week: string;
  sale: boolean;
  stock: boolean;
}
