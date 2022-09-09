import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import ChannelEntity from '../../entity/channel.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { ProductEntity } from '../product/product.entity';
import { StoreEntity } from '../store/store.entity';

@Entity({
  name: 'tbl_sale',
})
export class SaleEntity extends ChannelEntity {
  /** 产品 */
  @ManyToOne(() => ProductEntity)
  @JoinColumn({
    name: 'product_id',
  })
  product: ProductEntity;

  /** 产品型号 */
  @Column({ name: 'product_name', comment: '产品型号' })
  productName: string;

  /** 数量 */
  @Column({ name: 'quantity', comment: '数量' })
  quantity: number;

  /** 价格 */
  @Column({ name: 'price', comment: '价格', nullable: true })
  price?: number;

  /** 总额 */
  @Column({ name: 'total', comment: '总价', nullable: true })
  total?: number;

  /** 门店 */
  @ManyToOne(() => StoreEntity)
  @JoinColumn({
    name: 'store_id',
  })
  store?: StoreEntity;

  /** 门店名称 */
  @Column({ name: 'store_name', comment: '门店名称', nullable: true })
  storeName?: string;

  /** 日期 */
  @Column({
    name: 'date',
    type: 'date',
    nullable: true,
    comment: '日。格式：2022-12-01，客户上传数据中带时间才会有',
  })
  date?: Date;

  /** 客户，产品卖给了谁，卖给了下一级的客户，此字段代表下一级的客户名称 */
  /** 客户id */
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'buyer_id',
  })
  buyer?: CustomerEntity;

  /** 客户名称 */
  @Column({ name: 'buyer_name', comment: '下级客户名称', nullable: true })
  buyerName?: string;
}
