// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { CustomerRelation } from './data.d';
import { ResultSuccessPromise } from '../../../types/common';

/** 获取标签 POST /api/customer/relations */
export async function getRelations() {
  return request<ResultSuccessPromise<CustomerRelation>>('/api/customer/relations', {
    method: 'GET',
  });
}
