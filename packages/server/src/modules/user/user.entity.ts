import { Column, Entity } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import BaseEntity from '../../entity/base.entity';

@Entity({
  name: 'tbl_user',
})
export class UserEntity extends BaseEntity {
  /** 客户名 */
  @ApiProperty()
  @Column({ comment: '客户名', unique: true })
  username: string;

  /** 密码 */
  @ApiHideProperty()
  @Column({ comment: '密码' })
  password: string;

  /** 邮箱 */
  @ApiProperty()
  @Column({ comment: '邮箱', unique: true })
  email: string;

  /** 手机 */
  @ApiProperty()
  @Column({ comment: '手机', unique: true })
  phone: string;
}
