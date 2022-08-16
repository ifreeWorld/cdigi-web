import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppException, ERROR, ErrorConstant } from '../constant/error';
import { Reflector } from '@nestjs/core';
import { CallHandler } from '@nestjs/common/interfaces/features/nest-interceptor.interface';
import { interceptorCatchError } from './exception.interceptor';
import { appLogger } from '../logger';

export interface ResponseResult<T> {
  code: number | string;
  message?: string;
  data?: T;
  [key: string]: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseResult<T>>
{
  private readonly logger = appLogger;
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        // service中return undefined的时候会走进来
        if (data === undefined) {
          throw new AppException(ERROR.RESOURCE_NOT_EXITS);
        }
        if (data instanceof ErrorConstant) {
          throw new AppException(data);
        }
        if (data instanceof StreamableFile) {
          return data;
        }
        return { code: 0, message: 'success', data: data };
      }),
      interceptorCatchError(this.logger),
    );
  }
}
