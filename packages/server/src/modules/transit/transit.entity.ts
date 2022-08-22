import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { CustomerEntity } from '../../modules/customer/customer.entity';

@Entity({
  name: 'tbl_transit',
})
export class TransitEntity extends BaseEntity {
  /** 录入系统时间，由前端直接传过来 */
  @Column({
    name: 'in_time',
    comment: '录入系统时间',
  })
  inTime: string;

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

  /** 预计到达时间 */
  @Column({
    name: 'eta',
    type: 'date',
    comment: '预计到达时间',
    nullable: true,
  })
  eta?: Date;

  /** 在途库存 - 运输时间 */
  @Column({
    name: 'shipping_date',
    type: 'date',
    comment: '在途库存 - 运输时间',
    nullable: true,
  })
  shippingDate?: Date;

  /** 入库时间，是在界面上操作的 */
  @Column({
    name: 'warehousing_date',
    type: 'date',
    comment: '入库时间',
    nullable: true,
  })
  warehousingDate?: Date;

  /** 所属客户，多对一 */
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customer_id',
  })
  customer: CustomerEntity;
}
