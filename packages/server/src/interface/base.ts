/** 统一接口返回格式 */
export class CommonResult<T> {
  /** 状态编码 */
  code: number;
  /** 提示信息 */
  message: string;
  /** 返回数据 */
  data: T;
}

/** 统一列表返回 */
export class CommonListResult<T> extends CommonResult<{
  list: T[];
  total: number;
}> {}
