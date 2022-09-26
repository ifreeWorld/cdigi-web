// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise, TableListData } from '../../../types/common';
import { CustomerType } from '../../../types/common';

export async function getAllValues(field: string) {
  return request<ResultSuccessPromise<any>>(`/api/customize/value/${field}`, {
    method: 'POST',
  });
}
