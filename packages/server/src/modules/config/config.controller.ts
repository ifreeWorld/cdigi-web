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
import { JwtGuard } from '../../guards';
import { ConfigService } from './config.service';
import {
  ConfigSearchDto,
  CreateConfigDto,
  ConfigGetByKeyResult,
} from './config.dto';

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
}
