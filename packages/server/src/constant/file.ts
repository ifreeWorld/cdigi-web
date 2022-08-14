export const mimeType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// 库存表头
export const stockHeaderMap = {
  库存型号: 'productName',
  库存数量: 'quantity',
  价格: 'price',
  总额: 'total',
  时间: 'date',
  门店: 'storeName',
};

// 销售表头
export const saleHeaderMap = {
  销售型号: 'productName',
  销售数量: 'quantity',
  客户: 'customerName',
  价格: 'price',
  总额: 'total',
  时间: 'date',
  门店: 'storeName',
};

// 在途库存表头
export const stockOnTheWayHeaderMap = {
  库存型号: 'productName',
  库存数量: 'quantity',
  价格: 'price',
  总额: 'total',
  运出时间: 'outDate',
};
