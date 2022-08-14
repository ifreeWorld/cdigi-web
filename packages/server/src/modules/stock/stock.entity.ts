import { Column, Entity } from 'typeorm';
import ChannelEntity from '../../entity/channel.entity';

@Entity({
  name: 'tbl_stock',
})
export class StockEntity extends ChannelEntity {
  /** 产品型号 */
  @Column({ name: 'product_name', comment: '产品型号' })
  productName: string;

  /** 数量 */
  @Column({ name: 'quantity', comment: '数量' })
  quantity: string;

  /** 价格 */
  @Column({ name: 'price', comment: '价格' })
  price?: string;

  /** 总额 */
  @Column({ name: 'total', comment: '总价' })
  total?: string;

  /** 门店名称 */
  @Column({ name: 'store_name', comment: '门店名称' })
  storeName?: string;
}
