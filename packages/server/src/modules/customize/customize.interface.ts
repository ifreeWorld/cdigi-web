/**
 * 数据透视的数据结构
 */
export interface PivotData {
  filter: PivotFilter[];
  row: PivotRow;
  line: PivotLine;
  value: PivotValue;
}

export type PivotFilterValue = string | number | boolean;

/**
 * 筛选
 */
export type PivotFilter =
  | {
      field: string;
      op: '=';
      value: PivotFilterValue;
    }
  | {
      field: string;
      op: 'in';
      value: PivotFilterValue[];
    }
  | {
      field: string;
      op: 'between';
      value: [PivotFilterValue, PivotFilterValue];
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
export interface PivotLine {
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
  aggregator: 'sum' | 'avg' | 'max' | 'min';
}

// export const testData: PivotData = {
//   filter: [
//     {
//       field: 'customerId',
//     },
//   ],
// };
