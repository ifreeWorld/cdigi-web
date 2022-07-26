import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppException, ERROR, CustomResponse } from './constant/error';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}
  getHello(): string {
    return 'Hello World!';
  }
  async getHello1() {
    try {
      const r = await this.httpService
        .request({
          method: 'POST',
          url: 'http://www.google.com/asdasdasdasdasd',
        })
        .toPromise();
      return r.data;
    } catch (e) {
      throw new CustomResponse('请求asd失败', e);
    }
    return 'Hello World!';
  }
  getHello2(): string {
    throw ERROR.RESOURCE_NOT_EXITS;
  }
}
