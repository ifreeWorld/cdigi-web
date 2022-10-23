import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportEntity } from './report.entity';
import { ConfigModule } from '../config/config.module';
import { SaleEntity } from '../sale/sale.entity';
import { StockEntity } from '../stock/stock.entity';

@Module({
  exports: [ReportService],
  imports: [
    TypeOrmModule.forFeature([ReportEntity, SaleEntity, StockEntity]),
    ConfigModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
