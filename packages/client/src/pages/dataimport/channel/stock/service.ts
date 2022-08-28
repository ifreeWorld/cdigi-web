// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { StockItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../../types/common';

/** 获取库存 POST /api/stock/list */
export async function getStock(
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
  return request<ResultSuccessPromise<TableListData<StockItem>>>('/api/stock/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取库存 POST /api/stock/all */
export async function getAllStock(params: any) {
  return request<ResultSuccessPromise<StockItem[]>>('/api/stock/all', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}

/** 上传excel POST /api/stock/parseFile */
export async function parseFile(data: any, options?: { [key: string]: any }) {
  return request('/api/stock/parseFile', {
    data,
    method: 'POST',
  });
}

/** 上传excel POST /api/stock/save */
export async function save(data: any, options?: { [key: string]: any }) {
  return request('/api/stock/save', {
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

/** 删除库存 POST /api/stock/delete */
export async function deleteStock(
  data: { ids: number[]; customerId: number },
  options?: { [key: string]: any },
) {
  return request('/api/stock/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
