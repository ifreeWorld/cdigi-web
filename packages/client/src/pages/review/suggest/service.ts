// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';
import { SuggestConfig, Summary, SummaryLeaf } from './data';

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

/**  GET /api/suggest/getConfig */
export async function getSuggestConfig() {
  return request<ResultSuccessPromise<SuggestConfig>>('/api/suggest/getConfig', {
    method: 'GET',
  });
}

/**  POST /api/suggest/save */
export async function saveSuggestConfig(data: any) {
  return request<ResultSuccessPromise<boolean>>('/api/suggest/save', {
    data,
    method: 'POST',
  });
}

/**  POST /api/suggest/export */
export async function exportSuggestReport(data: any) {
  return request<ResultSuccessPromise<boolean>>('/api/suggest/export', {
    data,
    method: 'POST',
  });
}
