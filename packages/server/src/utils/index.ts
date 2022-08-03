import { PaginationDto } from '../dto/Pagination.dto';
import crypto from 'crypto';
import * as dayjs from 'dayjs';

export * from './sqlUtil';

export function splice<T>(data: T[], search: PaginationDto): T[] {
  return data.splice((search.current - 1) * search.pageSize, search.pageSize);
}

export function getSkip(current: number, pageSize: number): number {
  return (current - 1) * pageSize;
}

export function getTotalPage(total: number, size: number): number {
  return Math.ceil(total / size);
}

/**
 * 加密算法
 * @param {string} data - 被加密的数据
 * @param {string} password - 加密所用的密码
 * @return {String} --
 * */
export const aesEncode = (data, password) => {
  const cipher = crypto.createCipher('aes192', password);
  let crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

/**
 * 解密算法
 * @param {string} data - 被解密的数据
 * @param {string} password - 加密时所用的密码
 * @return {String} --
 * */
export const aesDecode = (data, password) => {
  const decipher = crypto.createDecipher('aes192', password);
  let decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};

/** 日期格式化 */
export const formatDate = (date) => dayjs(date).format('YYYY-MM-DD hh:mm:ss');
