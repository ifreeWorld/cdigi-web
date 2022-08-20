import { Column, Entity } from 'typeorm';
import ChannelEntity from '../../entity/channel.entity';

@Entity({
  name: 'tbl_sale',
})
export class SaleEntity extends ChannelEntity {
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

  /** 门店名称 */
  @Column({ name: 'store_name', comment: '门店名称', nullable: true })
  storeName?: string;

  /** 销售日期 销售才有 */
  @Column({
    name: 'date',
    type: 'date',
    nullable: true,
    comment: '日。格式：2022-12-01，用户上传数据中带时间才会有',
  })
  date?: Date;

  /** 客户，产品卖给了谁 */
  buyerName?: string;
}
