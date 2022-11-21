import Big from 'big.js';

export type TimeWatcher = {
  u: number;
  mat: (bigint | number)[][];
};
export type Point = [number, number];
/**
 * 转换为序列
 * @param tw time watcher
 * @returns 所有点集的序列集
 */
export const toSeries = (tw: TimeWatcher): Point[][] => {
  const u = Big(tw.u);
  return tw.mat
    .map((group) => {
      if (!group.length) return [] as Big[];
      let lst = toBig(group[0]);
      const arr = Array<Big>(group.length - 1);
      for (let index = 1; index < group.length; index++) {
        const now = toBig(group[index]);
        arr[index - 1] = now.sub(lst).div(u);
        lst = now;
      }
      return arr;
    })
    .map((lines) => {
      return lines.map((point, i) => [i, point.toNumber()]) as Point[];
    });
};

function toBig(data: number | string | bigint) {
  if (typeof data === 'bigint') data = data.toString();
  return Big(data);
}
