import BaseEntity from 'src/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'tbl_report',
})
export class ReportEntity extends BaseEntity {
  /** 报告名称 */
  @Column({ name: 'report_name', comment: '报告名称', unique: true })
  reportName: string;

  /** 产品型号 */
  @Column({ name: 'product_names', comment: '产品型号，1;2;3;4', type: 'text' })
  productNames: string;

  /** 报告类型 */
  @Column({ name: 'report_type', comment: '报告类型，周报1 月报2' })
  reportType: number;
}
