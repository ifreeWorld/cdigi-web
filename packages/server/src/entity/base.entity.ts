import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export default class BaseEntity {
  /** ID */
  @PrimaryGeneratedColumn({ comment: '唯一 id' })
  id: number;
  /** 创建者 id */
  @Column({ comment: '创建者 id' })
  creator_id: number;
  /** 创建时间 */
  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  create_time?: Date;
}
