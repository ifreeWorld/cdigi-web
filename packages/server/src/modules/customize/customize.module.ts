import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '../customer/customer.module';
import { CustomizeController } from './customize.controller';
import { CustomizeService } from './customize.service';
import { CustomizeEntity } from './customize.entity';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { SaleModule } from '../sale/sale.module';
import { StockModule } from '../stock/stock.module';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomizeEntity, SaleEntity, StockEntity]),
    CustomerModule,
    ProductModule,
    StoreModule,
    SaleModule,
    StockModule,
    ConfigModule,
  ],
  exports: [CustomizeService],
  controllers: [CustomizeController],
  providers: [CustomizeService],
})
export class CustomizeModule {}
