import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportEntity } from './report.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  exports: [ReportService],
  imports: [TypeOrmModule.forFeature([ReportEntity]), ConfigModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
