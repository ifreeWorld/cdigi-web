import { CustomerType } from '../types/common.d';
export const customerTypeMap = {
  [CustomerType.vendor]: '品牌商',
  [CustomerType.disty]: '代理商',
  [CustomerType.dealer]: '经销商',
};

export const mimeType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const dateFormat = 'YYYY-MM-DD';
