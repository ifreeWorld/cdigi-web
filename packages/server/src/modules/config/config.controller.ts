import {
  Controller,
  Post,
  Get,
  Res,
  Body,
  Query,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtGuard } from '../../guards';
import { ConfigService } from './config.service';
import {
  ConfigSearchDto,
  CreateConfigDto,
  ConfigGetByKeyResult,
} from './config.dto';
import { tmpPath, mimeType } from '../../constant/file';
import { CustomResponse } from '../../constant/error';
import { CurrentUser } from 'src/decorators';

@ApiBearerAuth()
@ApiTags('全局配置')
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @UseGuards(JwtGuard)
  @Get('/hget')
  @ApiOkResponse({
    type: ConfigGetByKeyResult,
  })
  async hget(
    @Query() query: ConfigSearchDto,
    @CurrentUser() currentUser,
  ): Promise<string> {
    const { key } = query;
    const res = await this.configService.hget(key, currentUser.id);
    return res;
  }

  @UseGuards(JwtGuard)
  @Post('/hset')
  @ApiOkResponse({
    type: ConfigGetByKeyResult,
  })
  async set(
    @Body() body: CreateConfigDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    const res = await this.configService.hset(body, currentUser.id);
    return res;
  }

  /** 下载生成的excel错误文件 */
  @UseGuards(JwtGuard)
  @ApiQuery({
    name: 'fileName',
    description: '文件路径',
  })
  @Get('/downloadErrorExcel')
  async downloadErrorExcel(
    @Res({ passthrough: true }) res,
    @Query('fileName') fileName: string,
  ): Promise<StreamableFile> {
    const urlPath = `${tmpPath}/${fileName}`;
    if (!existsSync(urlPath)) {
      throw new CustomResponse('没有这个路径');
    }
    const file = createReadStream(urlPath);
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${encodeURIComponent(
        fileName,
      )}`,
    });
    return new StreamableFile(file);
  }

  /** 下载导入的excel模板 */
  @UseGuards(JwtGuard)
  @ApiQuery({
    name: 'filePath',
    description: '文件名称',
  })
  @Get('/downloadTemplate')
  async downloadTemplate(
    @Res({ passthrough: true }) res,
    @Query('fileName') fileName: string,
  ): Promise<StreamableFile> {
    const urlPath = join(__dirname, `../../../template/${fileName}`);
    if (!existsSync(urlPath)) {
      throw new CustomResponse('没有这个路径');
    }
    const file = createReadStream(urlPath);
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${fileName}`,
    });
    return new StreamableFile(file);
  }
}
