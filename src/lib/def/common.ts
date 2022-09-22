import { browser } from '$app/environment';
import { NoBaseSettingError } from './errors';

export type MaybeArray<T> = T | T[];

/**公用前缀标识符, 用于区分不同应用 */
export const COMMON_PREFIX = 'ifr-opencv-web' as string;
/**API基准的键(localStorge) */
export const API_BASE_KEY = `${COMMON_PREFIX}-api-base`;
/**API的HTTP协议(localStorge) */
export const API_P_HTTP_KEY = `${COMMON_PREFIX}-api-P-HTTP`;
/**API的WS协议(localStorge) */
export const API_P_WS_KEY = `${COMMON_PREFIX}-api-P-WS`;

/**网站名称 */
export const WEB_NAME = 'IFR 感知组调试终端';

/**
 * 获取API地址
 * @param key 键
 * @param type API类型
 * @returns 值
 * @throws {NoBaseSettingError} 未设定
 * @throws {Error} 非客户端
 */
export const getApiOrigin = (key: string, type: 'ws' | 'http' = 'http') => {
  if (!browser || !localStorage) throw new Error('Cannot run on non client side');
  let pk: string;
  if (type === 'ws') pk = API_P_WS_KEY;
  else if (type === 'http') pk = API_P_HTTP_KEY;
  else throw new Error('Unknown protocol type :' + type);

  const p = localStorage.getItem(pk);
  const v = localStorage.getItem(key);
  if (!p || !v) throw new NoBaseSettingError();
  return `${p}${v}`;
};

/**
 * 获取localStorage
 * @param key 键
 * @returns 值
 * @throws {NoBaseSettingError} 未设定
 * @throws {Error} 非客户端
 */
export const getLS = (key: string) => {
  if (!browser || !localStorage) throw new Error('Cannot run on non client side');
  const v = localStorage.getItem(key);
  if (!v) throw new NoBaseSettingError();
  return v;
};
