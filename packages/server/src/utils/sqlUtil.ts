import { FindOperator, Like, Between, MoreThan, LessThan } from 'typeorm';
import * as validator from 'class-validator';

/** 是否包含文字 */
export function indexOfLike<T>(
  value: T | FindOperator<T>,
): FindOperator<string> {
  return Like(`%${value}%`);
}

/** 计算日期范围 */
export function compareOperator(start: Date, end: Date): FindOperator<Date> {
  if (validator.isNotEmpty(start) && validator.isNotEmpty(start)) {
    return Between(start, end);
  }
  if (validator.isNotEmpty(start)) {
    return MoreThan(start);
  }
  if (validator.isNotEmpty(end)) {
    return LessThan(end);
  }
}

/**
 *  sql 中拼接列字段常用格式
 */
export const getValueByKey = <T>(data: T, keys: string[]) =>
  keys
    .map((k) => (typeof data[k] === 'number' ? data[k] : `'${data[k]}'`))
    .join(',');
