import { Column, Entity } from 'typeorm';
import BaseEntity from '../../entity/base.entity';

@Entity({
  name: 'tbl_suggest',
})
export class SuggestEntity extends BaseEntity {
  /** 产品型号 */
  @Column({ name: 'suggest_name', comment: '产品型号', unique: true })
  suggestName: string;

  /** 品牌 */
  @Column({ name: 'vendor_name', comment: '品牌' })
  vendorName: string;

  /** 一级分类 */
  @Column({ name: 'category_first_name', comment: '一级分类', nullable: true })
  categoryFirstName?: string;

  /** 二级分类 */
  @Column({ name: 'category_second_name', comment: '二级分类', nullable: true })
  categorySecondName?: string;

  /** 三级分类 */
  @Column({ name: 'category_third_name', comment: '三级分类', nullable: true })
  categoryThirdName?: string;
}
