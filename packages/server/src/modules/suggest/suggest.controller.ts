import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  StreamableFile,
  Query,
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

@ApiBearerAuth()
@ApiTags('产品')
@Controller('suggest')
export class SuggestController {
  constructor(private suggestService: SuggestService) {}

  /** 获取配置 */
  @UseGuards(JwtGuard)
  @Get('/getConfig')
  @ApiOkResponse({
    type: SuggestConfigDto,
  })
  async getSuggestConfig(
    @Query('customerId') customerId: SuggestConfigDto['customerId'],
    @CurrentUser() currentUser,
  ): Promise<SuggestConfigDto> {
    return this.suggestService.getSuggestConfig(customerId, currentUser.id);
  }

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
  @Post('/export')
  async export(
    @Res({ passthrough: true }) res,
    @CurrentUser() currentUser,
    @Body() body: exportDto,
  ): Promise<StreamableFile> {
    const { buf, fileName } = await this.suggestService.export(
      body,
      currentUser.id,
    );
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${encodeURIComponent(
        fileName,
      )}`,
    });
    return new StreamableFile(buf);
  }
}
