import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
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
  CustomizePivotDto,
  CustomizePivotResult,
  CustomizeValuesDto,
  SaleAndStockDto,
} from './customize.dto';
import { CustomizeEntity } from './customize.entity';

@ApiBearerAuth()
@ApiTags('自定义分析')
@Controller('customize')
export class CustomizeController {
  constructor(private customizeService: CustomizeService) {}

  /** 分页列表 */
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
      list: list.map((item) => {
        return {
          name: item.customizeName,
          analysisType: '1',
          source: '1',
          createTime: item.createTime,
        };
      }),
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

  /** 获取数据透视表结果 */
  @UseGuards(JwtGuard)
  @Post('/pivot')
  @ApiOkResponse({
    type: CustomizePivotResult,
  })
  async pivot(@Body() body: CustomizePivotDto, @CurrentUser() currentUser) {
    const list = await this.customizeService.getPivotData(body, currentUser.id);
    return list;
  }

  /** 获取字段的全量数据 */
  @UseGuards(JwtGuard)
  @Post('/value/:field')
  @ApiOkResponse({
    type: CustomizePivotResult,
  })
  async getAllValues(
    @Param() { field }: CustomizeValuesDto,
    @Body() body: { type: 'sale' | 'stock' },
    @CurrentUser() currentUser,
  ) {
    const list = await this.customizeService.getAllValues(
      field,
      body.type,
      currentUser.id,
    );
    return list;
  }

  /** 获取销售库存数据 */
  @UseGuards(JwtGuard)
  @Post('/saleAndStock')
  async saleAndStock(
    @Body() body: SaleAndStockDto,
    @CurrentUser() currentUser,
  ) {
    const list = await this.customizeService.saleAndStock(body, currentUser.id);
    return list;
  }

  /** 获取销售库存数据 */
  @UseGuards(JwtGuard)
  @Get('/getUploadSummary')
  async getUploadSummary(
    @Query('week') week: string,
    @CurrentUser() currentUser,
  ) {
    const list = await this.customizeService.getUploadSummary(
      week,
      currentUser.id,
    );
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
