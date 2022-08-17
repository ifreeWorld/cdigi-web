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
};

// 销售表头
export const saleHeaderMap = {
  '销售 - 型号': 'productName',
  '销售 - 数量': 'quantity',
  // 客户字段是指的产品卖给了谁，需要和customer表关联
  '销售 - 客户': 'customerName',
  '销售 - 价格': 'price',
  '销售 - 总额': 'total',
  '销售 - 时间': 'date',
  '销售 - 门店': 'storeName',
};

// 在途库存表头
export const onPassageStockHeaderMap = {
  '在途库存 - 型号': 'productName',
  '在途库存 - 数量': 'quantity',
  '在途库存 - 价格': 'price',
  '在途库存 - 总额': 'total',
  '在途库存 - 运输时间': 'deliveryDate',
  '在途库存 - 预计到达时间': 'eta',
};

export const stockSheetName = '库存';
export const saleSheetName = '销售';
export const onPassageStockSheetName = '在途库存';
