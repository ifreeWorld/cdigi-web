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

export interface SuggestConfig {
  // 过去一段时间库存或销售>0的机型
  monthCount: number;

  // 添加的产品型号
  addProduct?: string[];

  // 去除的产品型号
  removeProduct?: string[];

  // 期望安全库存周数
  expectSafeStockPeriod: number;

  // 平均销量的周数
  calcWeekCount: number;

  // 最小安全库存(推荐订单会保证最小安全库存)
  minSafeStock: number;

  // 开启门店推荐订单
  storeSwitch: boolean;

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
