import { API_BASE_KEY, getApiOrigin } from '$def/common';
import type { PlanInfo, PlanState, TaskDescriptions } from '$def/Task';

/**
 * 获取任务描述
 * @returns 任务描述/未初始化
 */
export const getTaskDescriptions = async (): Promise<TaskDescriptions> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/task/descriptions`);
  return await resp.json();
};

/**
 * 移除流程
 * @param planName 流程名称
 * @returns 是否成功移除
 */
export const removePlanInfo = async (planName: string): Promise<boolean> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/remove?pname=${planName}`, { method: 'DELETE' });
  return await resp.json();
};

/**
 * 保存流程
 * @param plan 流程
 * @returns 是否成功保存
 */
export const savePlanInfo = async (plan: PlanInfo): Promise<boolean> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/save`, {
    method: 'POST',
    body: JSON.stringify(plan),
    headers: { 'Content-Type': 'application/json;charset:utf-8' },
  });
  if (!resp.ok) return false;
  return await resp.json();
};

/**
 * 获取流程
 * @param planName 流程名称
 * @returns 流程信息/null
 */
export const getPlanInfo = async (planName: string): Promise<PlanInfo | null> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/get?pname=${planName}`);
  if (!resp.ok) return null;
  return await resp.json();
};

/**
 * 列出流程
 * @returns 所有流程名称
 */
export const listPlanInfo = async (): Promise<string[]> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/list`);
  return await resp.json();
};

/**
 * 获取流程状态
 * @returns 流程状态信息
 */
export const getPlanState = async (): Promise<PlanState> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/state`);
  return await resp.json();
};

/**
 * 使用流程
 * @param planName 流程名称
 */
export const usePlanInfo = async (planName: string): Promise<void> => {
  const base = getApiOrigin(API_BASE_KEY);
  await fetch(`${base}/plan/use?pname=${planName}`);
};
/**
 * 启动流程
 * @returns 是否成功启动
 */
export const startPlanInfo = async (): Promise<boolean> => {
  const base = getApiOrigin(API_BASE_KEY);
  const resp = await fetch(`${base}/plan/start`);
  return await resp.json();
};
/**
 * 停止流程
 */
export const stopPlanInfo = async (): Promise<void> => {
  const base = getApiOrigin(API_BASE_KEY);
  await fetch(`${base}/plan/stop`);
};
