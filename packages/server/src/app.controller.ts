import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ERROR } from './constant/error';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/getHello')
  getHello() {
    return ERROR.RESOURCE_EXITS;
  }
  @Get('/getHello1')
  async getHello1() {
    return await this.appService.getHello1();
  }
  @Get('/getHello2')
  getHello2() {
    return this.appService.getHello2();
  }
}
