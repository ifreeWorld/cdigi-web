import { LoggerService } from '@nestjs/common';
import { Request } from 'express';
import { configure, getLogger, PatternLayout } from 'log4js';

/**
 *  初始化 log4js
 */
const layout: PatternLayout = {
  type: 'pattern',
  pattern: '%[%d{yyyy/MM/dd-hh:mm:ss} [%p]%] [module: %X{module}] %m',
};

configure({
  appenders: {
    out: { type: 'stdout' },
    // web err 两个 appender 主要为了区分输出文件
    web: {
      type: 'dateFile',
      layout: layout,
      filename: 'logs/cdg-server',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
    err: {
      type: 'dateFile',
      layout: layout,
      filename: 'logs/cdg-error',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['out', 'web'], level: 'info' },
    err: { appenders: ['out', 'err'], level: 'error' },
  },
});

// web 日志
const webLogger = getLogger();
// 错误日志
const errLogger = getLogger('err');

export class AppLogger implements LoggerService {
  private context = 'APP';

  error(message: any, context?: string) {
    errLogger.addContext('module', context ?? this.context);
    errLogger.error(message);
    webLogger.addContext('module', context ?? this.context);
    webLogger.error('请查看对应 cdigi-error.log');
  }

  log(message: any, context?: string) {
    webLogger.addContext('module', context ?? this.context);
    webLogger.info(message);
  }

  warn(message: any, context?: string) {
    webLogger.addContext('module', context ?? this.context);
    webLogger.warn(message);
  }
}

export const appLogger = new AppLogger();

/**
 *  request logger
 */
export function formatRequest(req: Request) {
  return `${req.ip} ${req.method} ${req.originalUrl}`;
}
