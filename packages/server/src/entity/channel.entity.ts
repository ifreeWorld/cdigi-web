import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from './base.entity';

// 渠道销售数据基础entity
export default class ChannelEntity extends BaseEntity {
  /** 周开始日 */
  @Column({
    name: 'week_start_date',
    type: 'date',
    comment: '周开始日',
  })
  weekStartDate: Date;

  /** 周结束日 */
  @Column({
    name: 'week_end_date',
    type: 'date',
    comment: '周结束日',
  })
  weekEndDate: Date;

  /** 周 */
  @Column({
    name: 'week',
    comment: '周。格式：2022-12',
  })
  week: string;
}
