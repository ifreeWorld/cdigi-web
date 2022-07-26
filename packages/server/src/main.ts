import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appLogger } from './logger';
import { AppExceptionFilter } from './filter/exception.filter';
import { ErrorsInterceptor, TransformInterceptor } from './interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: appLogger,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      dismissDefaultMessages: true,
    }),
  );
  app.setGlobalPrefix('/api');
  app.useGlobalInterceptors(
    new TransformInterceptor(app.get('Reflector')),
    new ErrorsInterceptor(),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  await app.listen(3000);
}
bootstrap();
