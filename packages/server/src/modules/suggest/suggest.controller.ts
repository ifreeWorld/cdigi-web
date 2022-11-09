import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { SuggestService } from './suggest.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  SuggestListResult,
  SuggestCreateDto,
  SuggestUpdateDto,
  SuggestDeleteDto,
  SuggestIdResult,
  SuggestDataResult,
} from './suggest.dto';
import { SuggestEntity } from './suggest.entity';

@ApiBearerAuth()
@ApiTags('产品')
@Controller('suggest')
export class SuggestController {
  constructor(private suggestService: SuggestService) {}

  /** 推荐订单列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: SuggestListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<SuggestEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.suggestService.find(
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

  /** 全量推荐订单列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: SuggestDataResult,
  })
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<SuggestEntity[]> {
    const list = await this.suggestService.findAll(currentUser.id, query);
    return list;
  }

  /** 插入 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: SuggestIdResult,
  })
  async insert(
    @Body() body: SuggestCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.suggestService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: SuggestIdResult,
  })
  async update(@Body() body: SuggestUpdateDto): Promise<number> {
    return this.suggestService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: SuggestIdResult,
  })
  async delete(@Body() { ids }: SuggestDeleteDto) {
    return this.suggestService.delete(ids);
  }
}
