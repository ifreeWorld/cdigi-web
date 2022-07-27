import { Column, Entity } from 'typeorm';
import BaseEntity from '../../entity/base.entity';

@Entity({
  name: 'tbl_user',
})
export class UserEntity extends BaseEntity {
  /** 用户名 */
  @Column({ comment: '用户名', unique: true })
  username: string;
  /** 密码 */
  @Column({ comment: '密码' })
  password: string;
  /** 邮箱 */
  @Column({ comment: '邮箱', unique: true })
  email: string;
  /** 手机 */
  @Column({ comment: '手机', unique: true })
  phone: string;
}
