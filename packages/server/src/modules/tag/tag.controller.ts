import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { TagService } from './tag.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  TagListResult,
  TagCreateDto,
  TagUpdateDto,
  TagDeleteDto,
  TagIdResult,
  TagDataResult,
} from './tag.dto';
import { TagEntity } from './tag.entity';

@ApiBearerAuth()
@ApiTags('标签')
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  /** 标签列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: TagListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<TagEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.tagService.find(
      currentUser.id,
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }

  /** 全量客户列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: TagDataResult,
  })
  async findAll(@CurrentUser() currentUser): Promise<TagEntity[]> {
    const list = await this.tagService.findAll(currentUser.id);
    return list;
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: TagIdResult,
  })
  async insert(
    @Body() body: TagCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.tagService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: TagIdResult,
  })
  async update(@Body() body: TagUpdateDto): Promise<number> {
    return this.tagService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: TagIdResult,
  })
  async delete(@Body() { ids }: TagDeleteDto) {
    return this.tagService.delete(ids);
  }
}
