import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestController } from './suggest.controller';
import { SuggestService } from './suggest.service';
import { SuggestEntity } from './suggest.entity';
import { TagModule } from '../tag/tag.module';

@Module({
  exports: [SuggestService],
  imports: [TypeOrmModule.forFeature([SuggestEntity]), TagModule],
  controllers: [SuggestController],
  providers: [SuggestService],
})
export class SuggestModule {}
