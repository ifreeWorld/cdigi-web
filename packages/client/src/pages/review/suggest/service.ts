// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';
import { Summary, SummaryLeaf } from './data';

/** POST /api/customize/getUploadSummary */
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

/**  POST /api/suggest/save */
export async function saveSuggestConfig(data: any) {
  return request<ResultSuccessPromise<boolean>>('/api/suggest/save', {
    data,
    method: 'POST',
  });
}

/**  GET /api/suggest/export */
export async function exportSuggestReport(params: any) {
  return request<ResultSuccessPromise<boolean>>('/api/suggest/export', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}
