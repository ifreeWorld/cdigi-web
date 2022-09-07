import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { TagEntity } from '../tag/tag.entity';

@Entity({
  name: 'tbl_product',
})
export class ProductEntity extends BaseEntity {
  /** 产品型号 */
  @Column({ name: 'product_name', comment: '产品型号', unique: true })
  productName: string;

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

  /** 标签关联，多对多 */
  @ManyToMany(() => TagEntity, (tag) => tag.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'tbl_relation_product_tag',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: TagEntity[];
}
