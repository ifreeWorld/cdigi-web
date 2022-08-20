import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './customer.entity';

@Module({
  exports: [CustomerService],
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
