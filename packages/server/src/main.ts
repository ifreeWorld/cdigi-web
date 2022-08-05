import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('cdigi 接口文档')
    .setDescription('cdigi 接口文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
