import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '../customer/customer.module';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreEntity } from './store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity]), CustomerModule],
  exports: [StoreService],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
