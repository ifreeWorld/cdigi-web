import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestController } from './suggest.controller';
import { SuggestService } from './suggest.service';
import { ConfigModule } from '../config/config.module';
import { CustomerEntity } from '../customer/customer.entity';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';
import { TransitEntity } from '../transit/transit.entity';
import { CustomerModule } from '../customer/customer.module';

@Module({
  exports: [SuggestService],
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      SaleEntity,
      StockEntity,
      TransitEntity,
    ]),
    ConfigModule,
    CustomerModule,
  ],
  controllers: [SuggestController],
  providers: [SuggestService],
})
export class SuggestModule {}
