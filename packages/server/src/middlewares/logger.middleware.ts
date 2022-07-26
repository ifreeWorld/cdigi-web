import { Injectable, NestMiddleware } from '@nestjs/common';
import { appLogger, formatRequest } from '../logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req, res, next) {
    appLogger.log(formatRequest(req), 'LoggerMiddleware');
    next();
  }
}
