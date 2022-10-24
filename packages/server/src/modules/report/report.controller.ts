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
  ReportDeleteByReportNameDto,
  DetailDto,
} from './report.dto';
import { ReportEntity } from './report.entity';

@ApiBearerAuth()
@ApiTags('报告')
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
    @Body() body: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<ReportEntity[]> {
    const list = await this.reportService.findAll(currentUser.id, body);
    return list;
  }

  /** 添加 */
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
  @Post('/deleteByReportName')
  @ApiOkResponse({
    type: ReportIdResult,
  })
  async deleteByReportName(
    @Body() { reportName }: ReportDeleteByReportNameDto,
  ) {
    return this.reportService.deleteByReportName(reportName);
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

  /** 获取detail数据 */
  @UseGuards(JwtGuard)
  @Post('/detail')
  async detail(@Body() body: DetailDto, @CurrentUser() currentUser) {
    const list = await this.reportService.detail(currentUser.id, body);
    return list;
  }
}
