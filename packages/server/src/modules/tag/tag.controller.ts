import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TagService } from './tag.service';
import { JwtGuard } from '../../guards';
import { ERROR } from '../../constant/error';
import { getSkip } from '../../utils';
import { CurrentUser } from '../../decorators';
import { UserEntity } from '../user/user.entity';
import { PaginationDto } from '../../dto/pagination.dto';

@ApiTags('标签')
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  /** 退出登录 */
  @UseGuards(JwtGuard)
  @Get('/get')
  @ApiOkResponse({
    type: UserEntity,
  })
  async get(@Query() { current, pageSize }: PaginationDto) {
    return this.tagService.find(getSkip(current, pageSize));
  }
}
