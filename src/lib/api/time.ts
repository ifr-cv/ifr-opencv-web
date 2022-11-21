import { API_BASE_KEY, getApiOrigin } from '$def/common';
import type { TimeWatcher } from '$def/TimeWatcher';
import JSONbig from 'json-bigint';

/**
 * 获取TW列表
 */
export const getTimeWatcherList = async (): Promise<string[]> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/time/list`);
  return resp.json();
};
/**
 * 获取TW详细信息
 */
export const getTimeWatcher = async (type: string): Promise<TimeWatcher | null> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/time/detail?type=${type}`);
  if (!resp.ok) return null;
  return JSONbig.parse(await resp.text());
};
