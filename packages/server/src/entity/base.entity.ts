import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
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
  @Column({ comment: '创建者 id' })
  creator_id: number;

  @ApiProperty({
    example: '2010-01-02 12:00:00',
    description: '创建时间',
  })
  /** 创建时间 */
  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  create_time?: Date;

  @ApiProperty({
    example: '2010-01-02 12:00:00',
    description: '更新时间',
  })
  /** 更新时间 */
  @CreateDateColumn({ type: 'datetime', comment: '更新时间' })
  update_time?: Date;
}
