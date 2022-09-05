// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { CustomerListItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../types/common';
import { CustomerType } from '../../../types/common';

/** 获取标签 POST /api/customer/list */
export async function getCustomer(
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
  return request<ResultSuccessPromise<TableListData<CustomerListItem>>>('/api/customer/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取全部客户 POST /api/customer/all */
export async function getAllCustomer(params: { customerType?: CustomerType }) {
  return request<ResultSuccessPromise<CustomerListItem[]>>('/api/customer/all', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}
/** 获取全部客户 POST /api/customer/allByKey */
export async function getAllByKey(params: { key: string }) {
  return request<ResultSuccessPromise<string[]>>('/api/customer/allByKey', {
    params: {
      ...params,
    },
    method: 'GET',
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
