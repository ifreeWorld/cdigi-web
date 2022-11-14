// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';
import { Summary, SummaryLeaf } from './data';

/** 获取库存 POST /api/customize/getUploadSummary */
export async function getUploadSummary(params: any) {
  return request<ResultSuccessPromise<Summary[] | SummaryLeaf[]>>(
    '/api/customize/getUploadSummary',
    {
      params: {
        ...params,
      },
      method: 'GET',
    },
  );
}
