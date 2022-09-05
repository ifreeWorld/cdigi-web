export class AppException extends Error {
  readonly code: number;
  readonly message: string;
  readonly data?: any;
  constructor(errorConstant: ErrorConstant) {
    super();
    this.code = errorConstant.code;
    this.message = errorConstant.message;
    this.data = errorConstant.data;
  }
}

export class ErrorConstant {
  readonly code: number;
  readonly message: string;
  readonly data?: any;
  constructor(code: number, mssage: string, data?: any) {
    this.code = code;
    this.message = mssage;
    this.data = data;
  }
}

/**
 * 自定义返回提示信息及数据
 * code 为 1001
 * example: return new CustomResponse('呵呵', { ksks: 'ksks' });
 */
export class CustomResponse extends ErrorConstant {
  readonly message: string;
  readonly data?: any;

  constructor(message: string, data?: any) {
    const code = 1001;
    super(code, message, data);
    this.message = message;
    this.data = data;
  }
}

export const ERROR = {
  RESOURCE_NOT_EXITS: new ErrorConstant(-1, '资源不存在'),
  NAME_OR_PWD_ERROR: new ErrorConstant(2, '账号或密码错误'),
  TOKEN_EXPIRE: new ErrorConstant(3, '登陆状态已过期'),
  USER_DISABLE: new ErrorConstant(4, '客户已被禁用'),
  RESOURCE_EXITS: new ErrorConstant(5, '操作的数据已存在'),
};
