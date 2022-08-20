import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { SaleEntity } from './sale.entity';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { CustomerModule } from '../customer/customer.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity]),
    ProductModule,
    StoreModule,
    CustomerModule,
    ConfigModule,
  ],
  controllers: [SaleController],
  providers: [SaleService],
})
export class SaleModule {}
