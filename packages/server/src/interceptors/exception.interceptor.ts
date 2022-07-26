import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppException } from '../constant/error';
import { appLogger, AppLogger } from '../logger';
import { CallHandler } from '@nestjs/common/interfaces/features/nest-interceptor.interface';

export const interceptorCatchError = (logger: AppLogger) =>
  catchError((err: any) => {
    if (err instanceof AppException) {
      logger.error(err);
      return of({
        code: err.code,
        message: err.message,
        data: err.data,
      });
    } else if (err instanceof BadRequestException) {
      return throwError(err);
    } else {
      logger.error(err.stack || err);
      return throwError(new HttpException(err.message, HttpStatus.BAD_GATEWAY));
    }
  });

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = appLogger;

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(interceptorCatchError(this.logger));
  }
}
