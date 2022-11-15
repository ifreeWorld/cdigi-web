import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkSheet, utils, write, WorkBook } from 'xlsx';
import * as validator from 'class-validator';
import { ERROR } from 'src/constant/error';
import {
  suggestSheetName,
  suggestStoreSheetName,
  tmpPath,
  dateFormat,
} from '../../constant/file';
import { ConfigService } from '../config/config.service';
import { exportDto, SuggestConfigDto } from './suggest.dto';

@Injectable()
export class SuggestService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * 保存
   */
  async save(body: SuggestConfigDto, creatorId: number): Promise<boolean> {
    await this.configService.hset(
      { key: 'suggestConfig', value: JSON.stringify(body) },
      String(creatorId),
    );
    return true;
  }

  /**
   * 生成报告并下载
   */
  async export(query: exportDto, creatorId: number) {
    const { week, customerIds } = query;
    const wb = utils.book_new();
    const header = [
      ['Brand Selling Report'],
      ['Date:', '2020-07-06 —— 2022-07-06'],
      ['Consumer:', '2B'],
      ['Model', 'Stock', 'Sellout', 'Suggestion', 'Quantity'],
    ];
    // 数据获取
    const configStr = await this.configService.hget(
      'suggestConfig',
      String(creatorId),
    );
    const config: SuggestConfigDto = JSON.parse(configStr);

    const sheet = utils.aoa_to_sheet(header);
    sheet['!merges'] = [
      {
        //合并第一行数据[A1,B1,C1,D1,E1]
        s: {
          //s为开始
          c: 0, //开始列
          r: 0, //开始取值范围
        },
        e: {
          //e结束
          c: 4, //结束列
          r: 0, //结束范围
        },
      },
      {
        //合并第二行数据[B1,C1,D1,E1]
        s: {
          //s为开始
          c: 1, //开始列
          r: 1, //开始取值范围
        },
        e: {
          //e结束
          c: 4, //结束列
          r: 1, //结束范围
        },
      },
      {
        //合并第三行数据[B1,C1,D1,E1]
        s: {
          //s为开始
          c: 1, //开始列
          r: 2, //开始取值范围
        },
        e: {
          //e结束
          c: 4, //结束列
          r: 2, //结束范围
        },
      },
    ];
    utils.book_append_sheet(wb, sheet, suggestSheetName);
    const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }
}
