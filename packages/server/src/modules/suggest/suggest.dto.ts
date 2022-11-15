import { IsNotEmpty } from 'class-validator';
import { BaseResult } from 'src/interface/base.interface';
import { CustomerEntity } from '../customer/customer.entity';

export class SuggestConfigDto {
  @IsNotEmpty({
    message: 'monthCount不能为空',
  })
  monthCount: number;

  @IsNotEmpty({
    message: 'expectSafeStockPeriod不能为空',
  })
  expectSafeStockPeriod: number;

  @IsNotEmpty({
    message: 'calcWeekCount不能为空',
  })
  calcWeekCount: number;

  @IsNotEmpty({
    message: 'minSafeStock不能为空',
  })
  minSafeStock: number;

  @IsNotEmpty({
    message: 'storeSwitch不能为空',
  })
  storeSwitch: boolean;

  storeCalcWeekCount?: number;

  storeCoefficient?: number;

  storeSafeSwitch?: boolean;

  storeBeforeWeekCount?: number;

  storeMinSafeStock?: number;
}

export class exportDto {
  @IsNotEmpty({
    message: 'week不能为空',
  })
  week: string;

  @IsNotEmpty({
    message: 'customerIds不能为空',
  })
  customerIds: CustomerEntity['id'][];
}

export class SuggestStatusResult extends BaseResult {
  data: boolean;
}
