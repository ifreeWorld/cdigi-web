import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import { SearchDto, ListResult } from './tag.dto';
import { TagEntity } from './tag.entity';

@ApiTags('标签')
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  /** 标签列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: ListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<TagEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.tagService.find(
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }
}
