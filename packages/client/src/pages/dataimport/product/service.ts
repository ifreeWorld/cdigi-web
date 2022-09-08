// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ProductListItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../types/common';

/** 获取标签 POST /api/product/list */
export async function getProduct(
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
  return request<ResultSuccessPromise<TableListData<ProductListItem>>>('/api/product/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取标签 POST /api/product/all */
export async function getAllProduct(params: any) {
  return request<ResultSuccessPromise<ProductListItem[]>>('/api/product/all', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}

/** 添加客户 POST /api/product/add */
export async function addProduct(data: ProductListItem, options?: { [key: string]: any }) {
  return request('/api/product/add', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 编辑客户 POST /api/product/update */
export async function updateProduct(data: ProductListItem, options?: { [key: string]: any }) {
  return request('/api/product/update', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除客户 POST /api/product/delete */
export async function deleteProduct(data: { ids: number[] }, options?: { [key: string]: any }) {
  return request('/api/product/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 上传excel POST /api/product/parseFile */
export async function parseFile(data: any, options?: { [key: string]: any }) {
  return request('/api/product/parseFile', {
    data,
    method: 'POST',
  });
}

/** 上传excel POST /api/product/save */
export async function save(data: any, options?: { [key: string]: any }) {
  return request('/api/product/save', {
    data,
    method: 'POST',
  });
}

/** 下载文件 GET /api/config/downloadTemplate */
export async function downloadErrorExcel(params: { fileName: string }) {
  return request('/api/config/downloadErrorExcel', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}
/** 下载文件 GET /api/config/downloadTemplate */
export async function downloadTemplate(params: { fileName: string }) {
  return request('/api/config/downloadTemplate', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}
