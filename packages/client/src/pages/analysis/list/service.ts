// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise, TableListData } from '../../../types/common';
import { AnalysisListItem } from './data';

export async function getTableData(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    // 是否带上父节点
    parent?: boolean;
    /* 查询字段 */
    [key: string]: any;
  },
  options?: { [key: string]: any },
) {
  return request<ResultSuccessPromise<TableListData<AnalysisListItem>>>('/api/customize/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
