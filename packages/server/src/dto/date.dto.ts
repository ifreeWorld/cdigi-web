/**
 * 时间范围对象
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDate } from 'class-validator';

export class DateDto {
  /**
   * 当前页码
   */
  @ApiProperty()
  @IsOptional()
  @IsDate()
  startTime?: Date;

  /**
   * 分页大小
   */
  @ApiProperty()
  @IsOptional()
  @IsDate()
  endTime?: Date;
}
