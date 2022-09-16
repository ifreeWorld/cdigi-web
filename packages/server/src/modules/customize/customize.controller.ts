import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { CustomizeService } from './customize.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  CustomizeListResult,
  CustomizeDataResult,
  CustomizeCreateDto,
  CustomizeUpdateDto,
  CustomizeDeleteDto,
  CustomizeIdResult,
} from './customize.dto';
import { CustomizeEntity } from './customize.entity';

@ApiBearerAuth()
@ApiTags('自定义分析')
@Controller('customize')
export class CustomizeController {
  constructor(private customizeService: CustomizeService) {}

  /** 门店列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: CustomizeListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<CustomizeEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.customizeService.find(
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

  /** 全量列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: CustomizeDataResult,
  })
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<CustomizeEntity[]> {
    const list = await this.customizeService.findAll({
      ...query,
      creatorId: currentUser.id,
    });
    return list;
  }

  /** 创建 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: CustomizeIdResult,
  })
  async insert(
    @Body() body: CustomizeCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.customizeService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: CustomizeIdResult,
  })
  async update(@Body() body: CustomizeUpdateDto): Promise<number> {
    return this.customizeService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: CustomizeIdResult,
  })
  async delete(@Body() { ids }: CustomizeDeleteDto) {
    return this.customizeService.delete(ids);
  }
}
