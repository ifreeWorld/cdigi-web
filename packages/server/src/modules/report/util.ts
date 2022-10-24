/**
 * 周报计算方式：
 * 环比  (w2-w1)/w1  同比（w2-w1)/w1  平均比 (w2-Ave(W1-W4))/Ave(W1-W4)
 * 1、同比的W1是上个月的这一周吗？比如我要计算第5个月的第2周的数据，W1就是第4个月的第2周（w2-w1)/w1
 * 2、平均比的Ave(W1-W4)指的是，本周、上周、上上周、上上上周的平均值
 * 3、库存周转天数计算方式：2022-10周的库存量*7 / 过去四周平均销量（2022-10、2022-09、2022-08、2022-07）
 */

/**
 * 获取环比
 * @param data 本周数据
 * @param lastData 上周数据
 * @returns 环比
 */
export function getRingRatio(data, lastData) {
  if (lastData === 0) {
    return 'n/a';
  }
  return Number(((data - lastData) / lastData).toFixed(4));
}

/**
 * 获取同比
 * @param data 本周数据
 * @param lastData 上月同周数据
 * @returns 同比
 */
export function getSameRatio(data, lastData) {
  if (lastData === 0) {
    return 'n/a';
  }
  return Number(((data - lastData) / lastData).toFixed(4));
}

/**
 * 获取平均比
 * @param data 本周数据
 * @param lastData Ave(W1-W4)
 * @returns 平均比
 */
export function getAvgRatio(data, lastData) {
  if (lastData === 0) {
    return 'n/a';
  }
  return Number(((data - lastData) / lastData).toFixed(4));
}

/**
 * 获取均值，为0的就不作为值
 * @param arr 数据
 * @returns 均值
 */
export function getAvgNum(arr) {
  const count = arr.filter((item) => item !== 0).length;
  if (!count) {
    return 0;
  }
  const total = arr.reduce((prev, next) => prev + next, 0);
  return total / count;
}

/**
 * 获取库存周转天数，2022-10周的库存量*7 / 过去四周平均销量
 * @param stockNum 当前库存
 * @param saleTotal 销售总量
 * @returns 同比
 */
export function getStockTurn(stockNum, saleTotal) {
  if (saleTotal === 0) {
    return 0;
  }
  return Number(((7 * stockNum) / (saleTotal / 4)).toFixed(4));
}

export function sum(arr: number[]) {
  return arr.reduce((prev, next) => prev + next, 0);
}
