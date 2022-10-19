import { CustomerType } from '../types/common';
export const customerTypeMap = {
  [CustomerType.vendor]: '品牌商',
  [CustomerType.disty]: '代理商',
  [CustomerType.dealer]: '经销商',
};

export const mimeType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const dateFormat = 'YYYY-MM-DD';

export const weekdayMap = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

export const weekdayOptions = [
  {
    id: 0,
    label: '周日',
    value: '0',
  },
  {
    id: 1,
    label: '周一',
    value: '1',
  },
  {
    id: 2,
    label: '周二',
    value: '2',
  },
  {
    id: 3,
    label: '周三',
    value: '3',
  },
  {
    id: 4,
    label: '周四',
    value: '4',
  },
  {
    id: 5,
    label: '周五',
    value: '5',
  },
  {
    id: 6,
    label: '周六',
    value: '6',
  },
];
