import { Column, Entity } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import BaseEntity from '../../entity/base.entity';
import { CustomerType } from './customerType.enum';

@Entity({
  name: 'tbl_tag',
})
export class TagEntity extends BaseEntity {
  /** 标签名称 */
  @ApiProperty()
  @Column({ name: 'tag_name', comment: '标签名称', unique: true })
  tagName: string;

  /** 标签颜色 */
  @ApiHideProperty()
  @Column({ name: 'tag_name', comment: '标签颜色' })
  tagColor: string;

  /** 标签类型 */
  @ApiProperty()
  @Column({ name: 'tag_name', comment: '标签类型' })
  customerType: CustomerType;
}
