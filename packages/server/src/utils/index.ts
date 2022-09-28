import { PaginationDto } from '../dto';
import crypto from 'crypto';
import { SSF } from 'xlsx';
import * as dayjs from 'dayjs';

export * from './sqlUtil';
export * from './creatorUtil';

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

const basedate = new Date(1899, 11, 30, 0, 0, 0);
const dnthresh =
  basedate.getTime() +
  (new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;

const day_ms = 24 * 60 * 60 * 1000;
const days_1462_ms = 1462 * day_ms;

function datenum(v, date1904) {
  let epoch = v.getTime();
  if (date1904) {
    epoch -= days_1462_ms;
  }
  return (epoch - dnthresh) / day_ms;
}

export function fixImportedDate(date, is_date1904) {
  // Convert JS Date back to Excel date code and parse them using SSF module.
  const parsed = SSF.parse_date_code(datenum(date, false), {
    date1904: is_date1904,
  });
  return new Date(`${parsed.y}-${parsed.m}-${parsed.d}`);
  // or
  // return parsed;
  // or if you want to stick to JS Date,
  // return new Date(parsed.y, parsed.m, parsed.d, parsed.H, parsed.M, parsed.S);
}

export function trim(n: string | number | undefined | null) {
  if (typeof n === 'string') {
    return n.trim();
  }
  return n;
}

export function lowerCase(n: string | undefined | null) {
  if (typeof n === 'string') {
    return n.toLocaleLowerCase();
  }
  return n;
}

export function random() {
  return Math.random().toString(16).substring(2);
}

export function getYearText(year: string | number) {
  return `${year}`;
}

export function getMonthText(month: string | number) {
  return `${month}`;
}

export function getQuarterText(quarter: string | number) {
  return `第${quarter}季度`;
}

export function getMonthWeekText(
  month: string | number,
  weekalone: string | number,
) {
  return `${month}月${weekalone}周`;
}

export function getWeekaloneText(weekalone: string | number) {
  return `${weekalone}周`;
}
