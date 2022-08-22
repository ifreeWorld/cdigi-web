import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransitController } from './transit.controller';
import { TransitService } from './transit.service';
import { TransitEntity } from './transit.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransitEntity]), ProductModule],
  controllers: [TransitController],
  providers: [TransitService],
})
export class TransitModule {}
