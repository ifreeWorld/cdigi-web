import BaseEntity from 'src/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'tbl_report',
})
export class ReportEntity extends BaseEntity {
  /** 报告名称 */
  @Column({ name: 'report_name', comment: '报告名称' })
  reportName: string;

  /** 产品型号 */
  @Column({ name: 'product_names', comment: '产品型号，1;2;3;4' })
  productNames: string;

  /** 报告类型 */
  @Column({ name: 'report_type', comment: '报告类型，周报1 月报2' })
  reportType: number;

  /** 开始时间 */
  @Column({
    name: 'start_date',
    type: 'date',
    comment: '开始时间',
  })
  startDate: Date;

  /** 结束时间 */
  @Column({
    name: 'end_date',
    type: 'date',
    comment: '结束时间',
  })
  endDate: Date;

  /** 格式 */
  @Column({
    name: 'date',
    comment: '周报：2022-01 月报：2022-01',
  })
  date: string;

  /** 年 */
  @Column({
    name: 'year',
    comment: '年。格式：2022',
  })
  year: number;

  /** 月 */
  @Column({
    name: 'month',
    comment: '月。格式：1',
  })
  month: number;

  /** 周 */
  @Column({
    name: 'weekalone',
    comment: '周。格式：1、2、3、4',
    nullable: true,
  })
  weekalone: number;

  /** 季度 */
  @Column({
    name: 'quarter',
    comment: '季度。格式：1、2、3、4',
  })
  quarter: number;

  /** 月-周 */
  @Column({
    name: 'month_week',
    comment: '月-周，与month一起配合使用形成月-周。格式：1、2、3、4、5',
    nullable: true,
  })
  monthWeek: number;
}
