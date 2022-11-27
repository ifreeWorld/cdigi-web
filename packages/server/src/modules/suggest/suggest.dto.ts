import { IsNotEmpty } from 'class-validator';
import { BaseResult } from 'src/interface/base.interface';
import { CustomerEntity } from '../customer/customer.entity';

export class SuggestConfigDto {
  // 客户id，如果是批量，就是'vendor' | 'disty' | 'dealer'
  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: number | string;

  // 过去一段时间库存或销售>0的机型
  @IsNotEmpty({
    message: 'monthCount不能为空',
  })
  monthCount: number;

  // 添加的产品型号
  addProduct?: string[];

  // 去除的产品型号
  removeProduct?: string[];

  // 期望安全库存周数
  @IsNotEmpty({
    message: 'expectSafeStockPeriod不能为空',
  })
  expectSafeStockPeriod: number;

  // 平均销量的周数
  @IsNotEmpty({
    message: 'calcWeekCount不能为空',
  })
  calcWeekCount: number;

  // 最小安全库存(推荐订单会保证最小安全库存)
  @IsNotEmpty({
    message: 'minSafeStock不能为空',
  })
  minSafeStock: number;

  // 开启门店推荐订单
  storeSwitch?: boolean;

  // 平均销量的周数
  storeCalcWeekCount?: number;

  // 系数
  storeCoefficient?: number;

  // 开启后自动检索 N 周断货的库存，并推荐补货
  storeSafeSwitch?: boolean;

  // N
  storeBeforeWeekCount?: number;

  // 最小安全库存(推荐订单会保证最小安全库存)
  storeMinSafeStock?: number;
}

export class exportDto {
  @IsNotEmpty({
    message: 'week不能为空',
  })
  week: string;

  @IsNotEmpty({
    message: 'customerId不能为空',
  })
  customerId: string;

  @IsNotEmpty({
    message: 'customerIds不能为空',
  })
  customerIds: CustomerEntity['id'][];
}

export interface CustomerData {
  customerId: number;
  productName: string;
  week: string;
  quantity: number;
}
export interface StoreData extends CustomerData {
  storeName: string;
}

export class SuggestStatusResult extends BaseResult {
  data: boolean;
}
