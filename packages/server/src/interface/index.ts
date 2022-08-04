export * from './base';

export interface User {
  id: number;
}

export interface CRequest extends Request {
  user: User;
}

export interface Pager<T> {
  list: T[] | any;
  // 总条数
  total: number;
}
