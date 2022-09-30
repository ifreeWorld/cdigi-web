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
  year: number;

  /** 周 */
  @Column({
    name: 'weekalone',
    comment: '周。格式：1、2、3、4',
  })
  weekalone: number;

  /** 季度 */
  @Column({
    name: 'quarter',
    comment: '季度。格式：1、2、3、4',
  })
  quarter: number;

  /** 月 */
  @Column({
    name: 'month',
    comment: '月。格式：1',
  })
  month: number;

  /** 月-周 */
  @Column({
    name: 'month_week',
    comment: '月-周，与month一起配合使用形成月-周。格式：1、2、3、4、5',
  })
  monthWeek: number;

  /** 哪个客户渠道数据，多对一 */
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customer_id',
  })
  customer: CustomerEntity;
}
