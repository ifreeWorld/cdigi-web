import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../constant/error';
import { appLogger } from '../logger';

@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = appLogger;

  catch(exception, host: ArgumentsHost) {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(200).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
