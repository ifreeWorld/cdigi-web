import { Column, ManyToOne, JoinColumn } from 'typeorm';
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

  /** 年 */
  @Column({
    name: 'year',
    comment: '年。格式：2022',
  })
  year: string;

  /** 周 */
  @Column({
    name: 'weekalone',
    comment: '周。格式：1周、2周',
  })
  weekalone: string;

  /** 季度 */
  @Column({
    name: 'quarter',
    comment: '季度。格式：第1季度、第2季度、第3季度、第4季度',
  })
  quarter: string;

  /** 月 */
  @Column({
    name: 'month',
    comment: '月。格式：1',
  })
  month: string;

  /** 月-周 */
  @Column({
    name: 'month_week',
    comment: '月-周。格式：1月1周、1月2周、1月3周、1月4周',
  })
  monthWeek: string;

  /** 哪个客户渠道数据，多对一 */
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customer_id',
  })
  customer: CustomerEntity;
}
