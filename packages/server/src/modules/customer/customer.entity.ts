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
import { StockEntity } from '../stock/stock.entity';
import { CustomerType } from '../tag/customerType.enum';

@Entity({
  name: 'tbl_customer',
})
export class CustomerEntity extends BaseEntity {
  /** 客户名称 */
  @Column({ name: 'customer_name', comment: '客户名称', unique: true })
  customerName: string;

  /** 客户类型 */
  @Column({
    name: 'customer_type',
    type: 'enum',
    enum: CustomerType,
    comment: '客户类型 1|品牌商 2|代理商 3|经销商',
  })
  customerType: CustomerType;

  /** 国家 */
  @Column({ name: 'country', comment: '国家' })
  country: string;

  /** 区域 */
  @Column({ name: 'region', comment: '区域' })
  region: string;

  /** 客户邮箱 */
  @Column({ name: 'email', comment: '客户邮箱' })
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
