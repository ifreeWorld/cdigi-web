// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { StoreListItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../types/common';

/** 获取门店 POST /api/store/list */
export async function getStore(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    /* 查询字段 */
    [key: string]: any;
  },
  options?: { [key: string]: any },
) {
  return request<ResultSuccessPromise<TableListData<StoreListItem>>>('/api/store/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}

/** 添加门店 POST /api/store/add */
export async function addStore(data: StoreListItem, options?: { [key: string]: any }) {
  return request('/api/store/add', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 编辑门店 POST /api/store/update */
export async function updateStore(data: StoreListItem, options?: { [key: string]: any }) {
  return request('/api/store/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除门店 POST /api/store/delete */
export async function deleteStore(data: { ids: number[] }, options?: { [key: string]: any }) {
  return request('/api/store/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
