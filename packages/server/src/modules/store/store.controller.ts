import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { StoreService } from './store.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  StoreListResult,
  StoreCreateDto,
  StoreUpdateDto,
  StoreDeleteDto,
  StoreIdResult,
} from './store.dto';
import { StoreEntity } from './store.entity';

@ApiBearerAuth()
@ApiTags('门店')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  /** 门店列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: StoreListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<StoreEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.storeService.find(
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async insert(
    @Body() body: StoreCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.storeService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async update(@Body() body: StoreUpdateDto): Promise<number> {
    return this.storeService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async delete(@Body() { ids }: StoreDeleteDto) {
    return this.storeService.delete(ids);
  }
}
