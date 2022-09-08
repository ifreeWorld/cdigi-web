import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { TagModule } from '../tag/tag.module';

@Module({
  exports: [ProductService],
  imports: [TypeOrmModule.forFeature([ProductEntity]), TagModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
