/**
 * 分页对象
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, isNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  /**
   * 当前页码
   */
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : 1))
  @IsNumber()
  @Min(1)
  current?: number = 1;

  /**
   * 分页大小
   */
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : 10))
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;
}
