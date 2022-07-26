import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/getHello')
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/getHello1')
  async getHello1() {
    return await this.appService.getHello1();
  }
  @Get('/getHello2')
  getHello2(): string {
    return this.appService.getHello2();
  }
}
