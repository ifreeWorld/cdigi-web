// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { CustomerTag } from './data';
import { ResultSuccessPromise, TableListData } from '../../../types/common';

/** 获取标签 POST /api/tag/list */
export async function getTag(
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
  return request<ResultSuccessPromise<TableListData<CustomerTag>>>('/api/tag/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取标签 POST /api/tag/all */
export async function getAllTag() {
  return request<ResultSuccessPromise<CustomerTag[]>>('/api/tag/all', {
    method: 'GET',
  });
}

/** 添加标签 POST /api/tag/add */
export async function addTag(data: CustomerTag, options?: { [key: string]: any }) {
  return request('/api/tag/add', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新标签 POST /api/tag/update */
export async function updateTag(data: CustomerTag, options?: { [key: string]: any }) {
  return request('/api/tag/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除标签 POST /api/tag/delete */
export async function deleteTag(data: { ids: number[] }, options?: { [key: string]: any }) {
  return request('/api/tag/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
