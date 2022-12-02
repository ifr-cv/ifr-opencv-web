import { browser } from '$app/environment';

/**
 * 保存变量
 * @param key 键
 * @param val 值
 */
export const saveStorage = (key: string, val: any) => {
  if (browser && localStorage && key) localStorage.setItem(key, JSON.stringify(val));
};
/**
 * 加载变量
 * @param key 键
 * @param val 值
 * @returns 加载值/默认值
 */
export const loadStorage = <T>(key: string, val: T): T => {
  if (browser && localStorage && key) {
    const sv = localStorage.getItem(key);
    if (sv !== null)
      try {
        return JSON.parse(sv);
      } catch (e) {
        e;
      }
  }
  return val;
};
