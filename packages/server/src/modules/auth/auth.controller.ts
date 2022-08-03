import { Controller, Post, Get, Body, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as dayjs from 'dayjs';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { JwtGuard } from '../../guards';
import { ERROR } from '../../constant/error';
import { CurrentUser } from '../../decorators';
import { UserEntity } from '../user/user.entity';

@ApiTags('登录')
@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOkResponse()
  @ApiBearerAuth()
  async login(
    @Body() { username, password }: LoginPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      this.clearCookie(res);
      throw ERROR.NAME_OR_PWD_ERROR;
    }

    const token = await this.authService.login(user);
    const expires = dayjs().add(7, 'd').toDate();
    res.cookie('cdigi_user_name', user.username, { expires });
    res.cookie('cdigi_token', token, {
      expires,
    });
    return token;
  }

  /** 退出登录 */
  @UseGuards(JwtGuard)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearCookie(res);
    return '退出成功';
  }

  /** 当前登录用户 currentUser: { cname, sname } */
  @UseGuards(JwtGuard)
  @Get('/currentUser')
  @ApiOkResponse({
    type: UserEntity,
  })
  async getUser(@CurrentUser() user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /** 清除登录相关 cookie */
  clearCookie(res: Response) {
    res.clearCookie('cdigi_user_name');
    res.clearCookie('cdigi_token');
  }
}
