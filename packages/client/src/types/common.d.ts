import ProTable from '@ant-design/pro-table';

/** 表格请求 query 类型 */
export type TableRequestParameters = Parameters<
  Required<React.ComponentProps<typeof ProTable>>['request']
>;

/* 表格分页 */
export interface TablePagination {
  total: number;
  pageSize: number;
  current: number;
}

/** 表格 request 返回数据类型，必须有 data、success */
export interface TableRequestResult<T> {
  [key: string]: unknown;
  /** 请求状态 */
  success: boolean;
  /** 数据 */
  data: T[];
  /** 总数 */
  total: number;
}

export interface TableListData<T> {
  /** 数据 */
  list: T[];
  /** 总数 */
  total: number;
}

export interface ResultSuccess<T> {
  code: number;
  message: string;
  data: T;
}
export type ResultSuccessPromise<T> = Promise<ResultSuccess<T>>;

/* AntD charts data item */
export interface AntDChartDataItem {
  name: string;
  value: number | string;
}

/** 描述字段展示类型 - description */
export interface IDescription<T> {
  label: string;
  key: keyof T;
  json?: boolean;
  format?: (val?: any) => string;
  color?: string;
}

/** 表格 - 表头字段展示 */
export type IKeysInfo<T> = {
  [K in keyof T]?: string;
};

export type PageParams = {
  current?: number;
  pageSize?: number;
};

export type LoginParams = {
  username: string;
  password: string;
};

export type ErrorResponse = {
  /** 业务约定的错误码 */
  errorCode: string;
  /** 业务上的错误信息 */
  errorMessage?: string;
  /** 业务上的请求是否成功 */
  success?: boolean;
};

export type NoticeIconList = {
  data?: NoticeIconItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};

export type NoticeIconItemType = 'notification' | 'message' | 'event';

export type NoticeIconItem = {
  id?: string;
  extra?: string;
  key?: string;
  read?: boolean;
  avatar?: string;
  title?: string;
  status?: string;
  datetime?: string;
  description?: string;
  type?: NoticeIconItemType;
};
