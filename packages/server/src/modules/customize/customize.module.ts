import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '../customer/customer.module';
import { CustomizeController } from './customize.controller';
import { CustomizeService } from './customize.service';
import { CustomizeEntity } from './customize.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomizeEntity]), CustomerModule],
  exports: [CustomizeService],
  controllers: [CustomizeController],
  providers: [CustomizeService],
})
export class CustomizeModule {}
