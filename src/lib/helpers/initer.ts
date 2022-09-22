/** 完毕等待回调 */
let finishResolve: (v: void) => void;
/** 完毕等待回调 */
let startResolve: (v: void) => void;

/**
 * 所有初始化模块
 */
const waitList = ['basic_data'] as const;
/** 所有初始化模块的类型 */
type waitTypes = typeof waitList[number];

/**
 * 所有等待器
 *
 * 每一个初始化项附加一个等待器, 可以使用 {@link afterOther} 等待其他模块初始化完毕
 */
let allWaits: { [key in waitTypes]?: { p: Promise<void>; r: (v: void) => void } } | undefined =
  (() => {
    const aw: { [key in waitTypes]?: { p: Promise<void>; r: (v: void) => void } } = {};
    waitList.forEach((k) => {
      const data: any = {};
      const p = new Promise<void>((r) => (data.r = r));
      data.p = p;
      aw[k] = data;
    });
    return aw as any;
  })();
/**等待列表, 不可动态添加*/
let waits: Set<waitTypes> | undefined = new Set(waitList);
/**
 * 初始化完毕等待方法
 *
 * 使用如下代码即可等待初始化完毕, 在加载完毕后 {@code finishWaiter} 会变为undefined:
 * ```js
 * await finishWaiter
 * ```
 *
 */
export let finishWaiter: Promise<void> | undefined = new Promise<void>((r) => (finishResolve = r));
/**
 * 初始化开始等待方法.
 *
 * 异步初始化操作(尤其是数据库操作等) 需要等待初始化信号发出后再执行.
 *
 * 使用如下代码即可等待初始化开始, 在加载完毕后 {@code startWaiter} 会变为undefined:
 * ```js
 * await startWaiter
 * ```
 *
 */
export const startWaiter: Promise<void> | undefined = new Promise<void>((r) => (startResolve = r));
/**
 * 异步初始化完成调用函数
 *
 * 所有启动前需要初始化的异步操作都应调用此函数.
 * 其中, 初始化列表由内部的waits集合决定, 需要手动修改.
 *
 * @param type 完成的初始化项
 */
export let initFinish = (type: waitTypes): void => {
  const aw = allWaits || {};
  const pr = aw[type];
  delete aw[type];
  if (pr && pr.r) pr.r(); //释放步骤

  if (!waits?.delete(type)) {
    console.error('错误的初始化完毕类型: ' + type);
    return;
  }
  if (!waits || waits.size) return;
  console.log('初始化完毕');
  initFinish = (type: string): void => {
    console.error('错误的初始化完毕类型: ' + type);
  };
  allWaits = waits = finishWaiter = undefined;

  finishResolve();
};
/**
 * 开始初始化
 *
 * 异步初始化操作(尤其是数据库操作等) 需要等待初始化信号发出后再执行
 * @returns 是否启动初始化
 * @returns false: 已经启动过初始化, 此次操作无效
 */
export let initStart = (): boolean => {
  initStart = () => false;
  console.log('开始初始化: ' + Object.keys(allWaits || {}));
  startResolve();
  return true;
};
/**
 * 在其他初始化项初始化后运行
 *
 * 请自行检查死锁问题
 * @param type 等待的初始化项
 */
export const afterOther = (type: waitTypes): Promise<void> | undefined => {
  const pr = (allWaits || {})[type];
  return pr ? pr.p : undefined;
};
