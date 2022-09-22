export class NoBaseSettingError {
  readonly type = 'NoBaseSettingError' as const;
}

export const isNoBaseSettingError = (data: any): data is NoBaseSettingError => {
  return data && data.type === 'NoBaseSettingError';
};
