// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';

export async function getAllValues(field: string, type: 'sale' | 'stock') {
  return request<ResultSuccessPromise<any>>(`/api/customize/value/${field}`, {
    data: {
      type,
    },
    method: 'POST',
  });
}
