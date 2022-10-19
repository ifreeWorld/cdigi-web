import { CustomerType } from 'src/modules/tag/customerType.enum';

export const customerTypeMap = {
  [CustomerType.vendor]: '品牌商',
  [CustomerType.disty]: '代理商',
  [CustomerType.dealer]: '经销商',
};
