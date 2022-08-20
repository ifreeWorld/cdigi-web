// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { SaleItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../../types/common';

/** 获取库存 POST /api/sale/list */
export async function getSale(
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
  return request<ResultSuccessPromise<TableListData<SaleItem>>>('/api/sale/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取库存 POST /api/sale/all */
export async function getAllSale(params: any) {
  return request<ResultSuccessPromise<SaleItem[]>>('/api/sale/all', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}

/** 上传excel POST /api/sale/parseFile */
export async function parseFile(data: any, options?: { [key: string]: any }) {
  return request('/api/sale/parseFile', {
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

/** 删除库存 POST /api/sale/delete */
export async function deleteSale(
  data: { ids: number[]; customerId: number },
  options?: { [key: string]: any },
) {
  return request('/api/sale/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
