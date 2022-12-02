import Big from 'big.js';

export const keys = <K extends string>(data: Record<K, any>) => Object.keys(data) as K[];
/**
 * 延时函数, 默认1ms
 * @param delay 延时时长
 * @returns 延时器
 */
export const delay = (delay = 1) => new Promise((r) => setTimeout(r, delay));

export const toObj = <K extends string | number | symbol, V>(
  k: readonly K[],
  v: readonly V[] | ((k: K, index: number) => V),
) => {
  const obj: Record<K, V> = {} as any;
  for (let i = 0; i < k.length; i++)
    obj[k[i]] = Array.isArray(v) ? v[i] : (v as (k: K, index: number) => V)(k[i], i);
  return obj;
};

export const remSubObj = (data: any) => {
  const a: any = {};
  for (const k1 in data) {
    const b: any = {};
    for (const k2 in data[k1]) {
      if (typeof data[k1][k2] !== 'object') b[k2] = data[k1][k2];
    }
    a[k1] = b;
  }
  return a;
};

export const avg = (...datas: number[]) => {
  let sum = Big(0);
  datas.map((x) => Big(x)).forEach((x) => (sum = sum.add(x)));
  return sum.div(datas.length).toNumber();
};

export const sum = (...datas: number[]) => {
  let sum = Big(0);
  datas.map((x) => Big(x)).forEach((x) => (sum = sum.add(x)));
  return sum.toNumber();
};

export function flip(data: Record<string, string>): Record<string, string> {
  const r: any = {};
  for (const k in data) r[data[k]] = k;
  return r;
}
