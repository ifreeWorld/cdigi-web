import { Column, Entity, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import BaseEntity from '../../entity/base.entity';
import { TagEntity } from '../tag/tag.entity';
import { StoreEntity } from '../store/store.entity';
import { CustomerType } from '../tag/customerType.enum';

// @Entity({
//   name: 'tbl_customer_closure',
// })
// @Tree('closure-table', {
//   closureTableName: 'tbl_customer',
//   ancestorColumnName: (column) => 'ancestor_' + column.propertyName,
//   descendantColumnName: (column) => 'descendant_' + column.propertyName,
// })
export class CustomerClosureEasdasdntity {
  @Column({ name: 'ancestor_id', comment: '父节点id' })
  ancestorId: number;
}
