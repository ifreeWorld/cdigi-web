/**
 * 数据透视的数据结构
 */
export interface PivotData {
  type: 'sale' | 'stock';
  filter: PivotFilter[];
  row: PivotRow;
  column: PivotColumn;
  value: PivotValue;
}

export type PivotFilterValue = string | number | boolean;

/**
 * 筛选
 */
export type PivotFilter = {
  field: string;
  op: 'in';
  value: PivotFilterValue[];
};

/**
 * 行
 */
export interface PivotRow {
  field: string;

  /**
   * 行的筛选
   */
  filter: PivotFilter;
}

/**
 * 列
 */
export interface PivotColumn {
  field: string;

  /**
   * 列的筛选
   */
  filter: PivotFilter;
}

/**
 * 值
 */
export interface PivotValue {
  field: string;

  /**
   * 聚合类型
   */
  aggregator: 'sum' | 'count' | 'avg' | 'max' | 'min';
}

export const testData: PivotData = {
  type: 'sale',
  filter: [
    {
      field: 'customerId',
      op: 'in',
      value: [5, 6],
    },
  ],
  row: {
    field: 'year',
    filter: {
      field: 'year',
      op: 'in',
      value: [2021, 2022],
    },
  },
  column: {
    field: 'productName',
    filter: {
      field: 'productName',
      op: 'in',
      value: ['TL-WA850RE', 'TL-WN725N'],
    },
  },
  value: {
    field: 'quantity',
    aggregator: 'sum',
  },
};
