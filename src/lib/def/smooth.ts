export class Smooth {
  size: number;
  arr: number[];
  index = 0;

  constructor(size: number) {
    this.size = size;
    this.arr = Array(size).fill(NaN);
  }
  push(v: number) {
    this.arr[this.index] = v;
    this.index = (this.index + 1) % this.size;
  }
  get() {
    return Math.max(...this.arr.filter((x) => !isNaN(x)));
  }
}
