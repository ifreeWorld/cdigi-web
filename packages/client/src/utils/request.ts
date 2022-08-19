import type { ResponseError, RequestInterceptor, ResponseInterceptor } from 'umi-request';
import { notification } from 'antd';
import FileSaver from 'file-saver';
import Cookies from 'js-cookie';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '暂无权限，请联系平台方开通权限。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 *  异常处理程序
 *  仅处理 HTTP Error, 对于 HTTP status = 200 && code !== 0 的情况, 业务逻辑内部处理
 *  @see https://beta-pro.ant.design/docs/request-cn
 */
export const errorHandler = async (error: ResponseError) => {
  console.log(error);
  const {
    response,
    request: { options },
  } = error;
  // 跳过错误捕获
  if (options.skipErrorHandler) {
    return Promise.resolve(response);
  }

  const { headers } = response;
  let contentDisposition = headers.get('content-disposition');
  if (contentDisposition) {
    return Promise.resolve(response);
  }

  // HTTP Error
  const { status, url, statusText } = response;
  const res = await response.clone().json();
  const message = `${status}: ${res.message ?? codeMessage[status] ?? statusText}`;
  const description = `${options.method}: ${url}`;

  notification.error({
    message,
    description,
  });

  return Promise.reject(response);
};

/**
 *  请求拦截器
 */
export const requestInterceptors: RequestInterceptor = (url: string, options = {}) => {
  return {
    url,
    options: {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${Cookies.get('cdigi_token') || ''}`,
      },
    },
  };
};
/**
 *  响应拦截器
 *  预留, 后续有需求再添加, 目前无需做 HTTP Error 之外的拦截
 */
export const responseInterceptors: ResponseInterceptor = async (response: any) => {
  const { headers } = response;
  // 判断该响应是否为文件下载响应
  let contentDisposition = headers.get('content-disposition');
  if (contentDisposition) {
    const fileName = headers.get('content-disposition').split('=');
    let name = fileName[fileName.length - 1];
    name = decodeURIComponent(name.replace(/"/g, ''));

    if (!name) {
      console.error('filename is null');
      return response;
    }

    const data = await response.blob();

    if (data instanceof Blob) {
      FileSaver.saveAs(data, name);
    }
    return response;
  }

  // 接口业务逻辑异常处理
  const res = await response.clone().json();
  const { code } = res;
  if (code === 999) {
    notification.warn({
      message: `${res.message ?? '请求接口报错'}`,
    });
  }
  // 正常返回
  return response;
};
