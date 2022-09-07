import * as path from 'path';
export const tmpPath = path.join(__dirname, '../../tmp');

export const mimeType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// 库存表头
export const stockHeaderMap = {
  '库存 - 型号': 'productName',
  '库存 - 数量': 'quantity',
  '库存 - 价格': 'price',
  '库存 - 总额': 'total',
  '库存 - 门店': 'storeName',
  '库存 - 时间': 'date',
};

// 销售表头
export const saleHeaderMap = {
  '销售 - 型号': 'productName',
  '销售 - 数量': 'quantity',
  // 客户字段是指的产品卖给了谁，需要和customer表关联
  '销售 - 客户': 'buyerName',
  '销售 - 价格': 'price',
  '销售 - 总额': 'total',
  '销售 - 时间': 'date',
  '销售 - 门店': 'storeName',
};

// 在途库存表头
export const transitHeaderMap = {
  '在途库存 - 型号': 'productName',
  '在途库存 - 数量': 'quantity',
  '在途库存 - 价格': 'price',
  '在途库存 - 总额': 'total',
  // 即从上级供货商进货的时间，即上级供货商的工厂发货的时间
  '在途库存 - 运输时间': 'shippingDate',
  '在途库存 - 预计到达时间': 'eta',
};

// 门店表头
export const storeHeaderMap = {
  门店名称: 'storeName',
  所属经销商: 'customer',
  区域: 'region',
  门店地址: 'storeAddress',
};

export const stockSheetName = '库存';
export const saleSheetName = '销售';
export const transitSheetName = '在途库存';
export const storeSheetName = '门店';

export const dateFormat = 'YYYY-MM-DD';
export const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
