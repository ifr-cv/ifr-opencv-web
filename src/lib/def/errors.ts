export class NoBaseSettingError {
  readonly type = 'NoBaseSettingError' as const;
  toString() {
    return '未进行基础设置';
  }
  getMsg() {
    return this.toString();
  }
}

export const isNoBaseSettingError = (data: any): data is NoBaseSettingError => {
  return data && data.type === 'NoBaseSettingError';
};
