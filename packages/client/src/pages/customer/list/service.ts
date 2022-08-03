// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { CustomerListItem } from './data';

/** 获取规则列表 GET /api/customer/list */
export async function getCustomer(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<{ data: CustomerListItem[]; total?: number }>('/api/customer/list', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加客户 POST /api/customer/add */
export async function addCustomer(data: CustomerListItem, options?: { [key: string]: any }) {
  return request('/api/customer/add', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 编辑客户 POST /api/customer/update */
export async function updateCustomer(data: CustomerListItem, options?: { [key: string]: any }) {
  return request('/api/customer/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除客户 POST /api/customer/delete */
export async function deleteCustomer(data: { ids: number[] }, options?: { [key: string]: any }) {
  return request('/api/customer/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
