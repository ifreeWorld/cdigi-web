import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { ReportService } from './report.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  ReportListResult,
  ReportCreateDto,
  ReportUpdateDto,
  ReportDeleteDto,
  ReportIdResult,
  ReportDataResult,
} from './report.dto';
import { ReportEntity } from './report.entity';

@ApiBearerAuth()
@ApiTags('产品')
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  /** 标签列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: ReportListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<ReportEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.reportService.find(
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
    type: ReportDataResult,
  })
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<ReportEntity[]> {
    const list = await this.reportService.findAll(currentUser.id, query);
    return list;
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: ReportIdResult,
  })
  async insert(
    @Body() body: ReportCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.reportService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: ReportIdResult,
  })
  async update(@Body() body: ReportUpdateDto): Promise<number> {
    return this.reportService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: ReportIdResult,
  })
  async delete(@Body() { ids }: ReportDeleteDto) {
    return this.reportService.delete(ids);
  }
}
