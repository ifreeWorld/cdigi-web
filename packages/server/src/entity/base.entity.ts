import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export default class BaseEntity {
  /** ID */
  @ApiProperty({
    example: 1,
    description: '主键id',
  })
  @PrimaryGeneratedColumn({ comment: '唯一 id' })
  id: number;

  /** 创建者 id */
  @ApiProperty({
    example: 1,
    description: '创建者 id',
  })
  @Column({ name: 'creator_id', comment: '创建者 id', nullable: true })
  creatorId: number;

  @ApiProperty({
    example: '2010-01-02 12:00:00',
    description: '创建时间',
  })
  /** 创建时间 */
  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    comment: '创建时间',
  })
  createTime?: Date;

  @ApiProperty({
    example: '2010-01-02 12:00:00',
    description: '更新时间',
  })
  /** 更新时间 */
  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
  })
  updateTime?: Date;
}
