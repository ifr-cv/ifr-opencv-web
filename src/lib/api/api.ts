import { getApiOrigin, API_BASE_KEY } from '$def/common';

/**
 * 获取API信息
 */
export const getApi = async (): Promise<{ pattern: string; method: string }[]> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/api.json`);
  return await resp.json();
};
