import { Column, Entity, ManyToMany } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { CustomerType } from './customerType.enum';
import { CustomerEntity } from '../customer/customer.entity';

@Entity({
  name: 'tbl_tag',
})
export class TagEntity extends BaseEntity {
  /** 标签名称 */
  @Column({ name: 'tag_name', comment: '标签名称', unique: true })
  tagName: string;

  /** 标签颜色 */
  @Column({ name: 'tag_color', comment: '标签颜色' })
  tagColor: string;

  /** 标签类型 */
  @Column({ name: 'customer_type', comment: '标签类型' })
  customerType: CustomerType;

  /** 标签关联，多对多 */
  @ManyToMany(() => CustomerEntity, (customer) => customer.tags)
  customers: CustomerEntity[];
}
