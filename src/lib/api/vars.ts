import { API_BASE_KEY, getApiOrigin } from '$def/common';
import type { VarDescriptions } from '$def/Variable';

/**是否启用vars */
export const isVarsEnable = async (): Promise<boolean> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/vars/enable`);
  if (!resp.ok) return false;
  return await resp.json();
};

/**获取vars的描述 */
export const getVarsDescriptions = async (): Promise<VarDescriptions> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/vars/descriptions`);
  if (!resp.ok) throw `${resp.status} | ${await resp.text()}`;
  return await resp.json();
};
/**获取var */
export const getVar = async (key: string): Promise<string> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/vars/var?key=${encodeURIComponent(key)}`);
  if (!resp.ok) throw `${resp.status} | ${await resp.text()}`;
  return await resp.text();
};
/**设置var */
export const setVar = async (key: string, val: string): Promise<string> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/vars/var?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    body: val,
    headers: { 'Content-Type': 'application/json;charset:utf-8' },
  });
  if (!resp.ok) throw `${resp.status} | ${await resp.text()}`;
  return await resp.text();
};
