import { IsNotEmpty, IsEnum } from 'class-validator';
import { BaseResult } from 'src/interface/base.interface';

export class ConfigSearchDto {
  @IsNotEmpty({
    message: 'key不能为空',
  })
  key: string;
}

export class CreateConfigDto {
  @IsNotEmpty({
    message: 'key不能为空',
  })
  key: string;

  value: string;
}

export class ConfigGetByKeyResult extends BaseResult {
  data: string;
}
