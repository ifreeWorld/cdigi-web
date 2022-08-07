import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  JoinTable,
  Tree,
} from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { TagEntity } from '../tag/tag.entity';
import { StoreEntity } from '../store/store.entity';
import { CustomerType } from '../tag/customerType.enum';

@Entity({
  name: 'tbl_customer',
})
export class CustomerEntity extends BaseEntity {
  /** 用户名称 */
  @Column({ name: 'customer_name', comment: '用户名称', unique: true })
  customerName: string;

  /** 用户类型 */
  @Column({ name: 'customer_type', comment: '用户类型' })
  customerType: CustomerType;

  /** 国家 */
  @Column({ name: 'country', comment: '国家' })
  country: string;

  /** 区域 */
  @Column({ name: 'region', comment: '区域' })
  region: string;

  /** 用户邮箱 */
  @Column({ name: 'email', comment: '用户邮箱' })
  email: string;

  /** 标签关联，多对多 */
  @ManyToMany(() => TagEntity, (tag) => tag.customers, {
    cascade: true,
  })
  @JoinTable({
    name: 'tbl_relation_customer_tag',
    joinColumn: {
      name: 'customer_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: TagEntity[];

  /* 门店关联，一对多 */
  @OneToMany(() => StoreEntity, (store) => store.customer)
  stores: StoreEntity[];

  @ManyToMany(() => CustomerEntity, (customer) => customer.children)
  @JoinTable({
    name: 'tbl_customer_closure',
    joinColumn: {
      name: 'descendant_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'ancestor_id',
      referencedColumnName: 'id',
    },
  })
  parent: CustomerEntity[];

  @ManyToMany(() => CustomerEntity, (customer) => customer.parent)
  children: CustomerEntity[];
}
