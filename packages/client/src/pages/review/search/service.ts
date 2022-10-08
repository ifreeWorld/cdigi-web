// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';

/** 获取库存 POST /api/customize/saleAndStock */
export async function getAllSale(data: any) {
  return request<ResultSuccessPromise<any[]>>('/api/customize/saleAndStock', {
    data,
    method: 'POST',
  });
}
