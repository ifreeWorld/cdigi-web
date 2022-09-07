import { Column, Entity, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { CustomerEntity } from '../customer/customer.entity';

@Entity({
  name: 'tbl_store',
})
export class StoreEntity extends BaseEntity {
  /** 门店名称 */
  @Column({ name: 'store_name', comment: '门店名称', unique: true })
  storeName: string;

  /** 门店区域 */
  @Column({ name: 'region', comment: '门店区域', nullable: true })
  region: string;

  /** 门店地址 */
  @Column({ name: 'store_address', comment: '门店地址', nullable: true })
  storeAddress: string;

  /** 所属经销商，多对一 */
  @ManyToOne(() => CustomerEntity, (customer) => customer.stores, {
    cascade: true,
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer: CustomerEntity;

  // @RelationId((store: StoreEntity) => store.customer)
  // customerId: CustomerEntity['id'];
}
