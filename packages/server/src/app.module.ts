import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ORM_CONFIG } from './constant/app.config';
import { LoggerMiddleware, NoCacheMiddleware } from './middlewares';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';
import { StoreModule } from './modules/store/store.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ORM_CONFIG,
      autoLoadEntities: true,
    }),
    HttpModule.register({
      timeout: 5 * 60 * 1000,
      maxRedirects: 5,
    }),
    AuthModule,
    TagModule,
    CustomerModule,
    StoreModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, NoCacheMiddleware).forRoutes('*');
  }
}
