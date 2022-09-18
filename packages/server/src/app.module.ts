import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ORM_CONFIG } from './constant/app.config';
import { LoggerMiddleware, NoCacheMiddleware } from './middlewares';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';
import { StoreModule } from './modules/store/store.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ConfigModule } from './modules/config/config.module';
import { ProductModule } from './modules/product/product.module';
import { StockModule } from './modules/stock/stock.module';
import { SaleModule } from './modules/sale/sale.module';
import { TransitModule } from './modules/transit/transit.module';
import { CustomizeModule } from './modules/customize/customize.module';
import { REDIS_CONFIG } from './constant/app.config';

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
    ConfigModule,
    ProductModule,
    StockModule,
    SaleModule,
    TransitModule,
    // CustomizeModule,
    RedisModule.forRoot({
      config: {
        port: REDIS_CONFIG.port,
        host: REDIS_CONFIG.host,
        password: REDIS_CONFIG.password,
        username: REDIS_CONFIG.username,
      },
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, NoCacheMiddleware).forRoutes('*');
  }
}
