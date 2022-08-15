import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockEntity } from './stock.entity';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockEntity]),
    ProductModule,
    StoreModule,
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
