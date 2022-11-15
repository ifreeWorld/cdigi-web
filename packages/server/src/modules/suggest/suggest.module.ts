import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestController } from './suggest.controller';
import { SuggestService } from './suggest.service';
import { ConfigModule } from '../config/config.module';
import { CustomerEntity } from '../customer/customer.entity';

@Module({
  exports: [SuggestService],
  imports: [TypeOrmModule.forFeature([CustomerEntity]), ConfigModule],
  controllers: [SuggestController],
  providers: [SuggestService],
})
export class SuggestModule {}
