import { Column, Entity } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { PivotData } from './customize.interface';

@Entity({
  name: 'tbl_customize',
})
export class CustomizeEntity extends BaseEntity {
  /** 自定义分析名称 */
  @Column({ name: 'customize_name', comment: '自定义分析名称', unique: true })
  customizeName: string;

  /** 自定义分析描述说明 */
  @Column({
    name: 'desc',
    comment: '自定义分析描述说明',
    nullable: true,
  })
  desc?: string;

  /** 数据透视表配置 */
  @Column({
    name: 'pivot',
    comment: '数据透视表配置',
    type: 'json',
  })
  pivot: PivotData;
}
