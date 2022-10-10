import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportEntity } from './report.entity';
import { TagModule } from '../tag/tag.module';
import { ConfigModule } from '../config/config.module';

@Module({
  exports: [ReportService],
  imports: [TypeOrmModule.forFeature([ReportEntity]), TagModule, ConfigModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
