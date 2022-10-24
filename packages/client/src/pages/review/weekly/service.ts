// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ResultSuccessPromise } from '../../../types/common';
import { WeeklyData } from './data';

/** 获取库存 POST /api/report/all */
export async function getReportList(data: any) {
  return request<ResultSuccessPromise<WeeklyData[]>>('/api/report/all', {
    data,
    method: 'POST',
  });
}

export async function addReport(data: any) {
  return request<ResultSuccessPromise<WeeklyData[]>>('/api/report/add', {
    data,
    method: 'POST',
  });
}

export async function getReportDetail(data: any) {
  return request<ResultSuccessPromise<WeeklyData[]>>('/api/report/detail', {
    data,
    method: 'POST',
  });
}

export async function deleteReport(data: any) {
  return request<ResultSuccessPromise<WeeklyData[]>>('/api/report/deleteByReportName', {
    data,
    method: 'POST',
  });
}

export async function getSummary(params: any) {
  return request<
    ResultSuccessPromise<{
      stockRingRatio: Record<number, number>;
      saleRingRatio: Record<number, number>;
    }>
  >('/api/report/summary', {
    params,
    method: 'GET',
  });
}

export async function setWeeklyGenerateDay(value: number) {
  return request('/api/config/hset', {
    data: {
      key: 'weeklyGenerateDay',
      value,
    },
    method: 'POST',
  });
}

export async function getWeeklyGenerateDay() {
  return request('/api/config/hget', {
    params: {
      key: 'weeklyGenerateDay',
    },
    method: 'GET',
  });
}
