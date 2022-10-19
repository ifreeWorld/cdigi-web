/**
 * 获取环比
 * @param data 本周数据
 * @param lastData 上周数据
 * @returns 环比
 */
export function getRingRatio(data, lastData) {
  if (lastData === 0) {
    return 0;
  }
  return Number(((data - lastData) / lastData).toFixed(4));
}

/**
 * 获取同比
 * @param data 本月数据
 * @param lastData 上月数据
 * @returns 同比
 */
export function getSameRatio(data, lastData) {
  if (lastData === 0) {
    return 0;
  }
  return Number(((data - lastData) / lastData).toFixed(4));
}
