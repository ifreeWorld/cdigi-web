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
    let file;
    if (!existsSync(urlPath)) {
      throw new CustomResponse('没有这个路径');
    }
    file = createReadStream(urlPath);
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename="error.xlsx"`,
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
    let file;
    if (!existsSync(urlPath)) {
      throw new CustomResponse('没有这个路径');
    }
    file = createReadStream(urlPath);
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=stock_template.xlsx`,
    });
    return new StreamableFile(file);
  }
}
