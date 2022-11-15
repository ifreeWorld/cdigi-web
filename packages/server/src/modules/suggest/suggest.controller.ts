import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { SuggestService } from './suggest.service';
import { JwtGuard } from '../../guards';
import {
  SuggestStatusResult,
  SuggestConfigDto,
  exportDto,
} from './suggest.dto';
import { mimeType } from 'src/constant/file';
import { query } from 'express';

@ApiBearerAuth()
@ApiTags('产品')
@Controller('suggest')
export class SuggestController {
  constructor(private suggestService: SuggestService) {}

  /** 保存 */
  @UseGuards(JwtGuard)
  @Post('/save')
  @ApiOkResponse({
    type: SuggestStatusResult,
  })
  async save(
    @Body() body: SuggestConfigDto,
    @CurrentUser() currentUser,
  ): Promise<boolean> {
    return this.suggestService.save(body, currentUser.id);
  }

  /** 生成报告并下载 */
  @UseGuards(JwtGuard)
  @Get('/export')
  async export(
    @Res({ passthrough: true }) res,
    @CurrentUser() currentUser,
    @Query() query: exportDto,
  ): Promise<StreamableFile> {
    const buf = await this.suggestService.export(query, currentUser.id);
    const fileName = '推荐订单.xlsx';
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${encodeURIComponent(
        fileName,
      )}`,
    });
    return new StreamableFile(buf);
  }
}
