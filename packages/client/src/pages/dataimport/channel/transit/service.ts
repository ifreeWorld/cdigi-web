// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { TransitItem } from './data';
import { ResultSuccessPromise, TableListData } from '../../../../types/common';

/** 获取库存 POST /api/transit/list */
export async function getTransit(
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
  return request<ResultSuccessPromise<TableListData<TransitItem>>>('/api/transit/list', {
    params: {
      ...params,
    },
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取库存 POST /api/transit/all */
export async function getAllTransit(params: any) {
  return request<ResultSuccessPromise<TransitItem[]>>('/api/transit/all', {
    params: {
      ...params,
    },
    method: 'GET',
  });
}

/** 上传excel POST /api/transit/parseFile */
export async function parseFile(data: any, options?: { [key: string]: any }) {
  return request('/api/transit/parseFile', {
    data,
    method: 'POST',
  });
}

/** 入库 POST /api/transit/update */
export async function update(data: any, options?: { [key: string]: any }) {
  return request('/api/transit/update', {
    data,
    method: 'POST',
  });
}

/** 导出数据 GET /api/transit/export */
export async function exportData(customerId: number) {
  return request('/api/transit/export', {
    params: {
      customerId,
    },
    method: 'GET',
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

/** 删除库存 POST /api/transit/delete */
export async function deleteTransit(
  data: { ids: number[]; customerId: number },
  options?: { [key: string]: any },
) {
  return request('/api/transit/delete', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}
