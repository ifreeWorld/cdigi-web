import {
  Controller,
  Post,
  Get,
  Res,
  Body,
  Query,
  Param,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
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

@ApiBearerAuth()
@ApiTags('全局配置')
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @UseGuards(JwtGuard)
  @Get('/getByKey')
  @ApiOkResponse({
    type: ConfigGetByKeyResult,
  })
  async getByKey(@Query() query: ConfigSearchDto): Promise<string> {
    const { key } = query;
    const res = await this.configService.get(key);
    return res;
  }

  @UseGuards(JwtGuard)
  @Post('/set')
  @ApiOkResponse({
    type: ConfigGetByKeyResult,
  })
  async set(@Body() body: CreateConfigDto): Promise<string> {
    const res = await this.configService.set(body);
    return res;
  }

  /** 下载文件 */
  @UseGuards(JwtGuard)
  @ApiParam({
    name: 'filePath',
    description: '文件路径',
  })
  @Get('/download/:filePath')
  async hasData(
    @Res({ passthrough: true }) res,
    @Param('filePath') filePath: string,
  ): Promise<StreamableFile> {
    const urlPath = `${tmpPath}/${filePath}`;
    const arr = filePath.split('/');
    const fileName = arr[arr.length - 1];
    let file;
    if (!existsSync(urlPath)) {
      throw new CustomResponse('没有这个路径');
    }
    file = createReadStream(urlPath);
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename="aaa.xlsx"`,
    });
    return new StreamableFile(file);
  }
}
