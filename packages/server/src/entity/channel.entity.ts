import { Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from './base.entity';
import { CustomerEntity } from '../modules/customer/customer.entity';

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

  /** 所属客户，多对一 */
  @ManyToOne(() => CustomerEntity, (customer) => customer.stores, {
    cascade: true,
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer: CustomerEntity;
}
