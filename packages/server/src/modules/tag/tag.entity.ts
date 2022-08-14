import { Column, Entity, ManyToMany } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { ProductEntity } from '../product/product.entity';

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

  /** 标签关联，多对多 */
  @ManyToMany(() => CustomerEntity, (customer) => customer.tags)
  customers: CustomerEntity[];

  /** 标签关联，多对多 */
  @ManyToMany(() => ProductEntity, (product) => product.tags)
  products: ProductEntity[];
}
