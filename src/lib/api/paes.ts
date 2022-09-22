/**跳转至流程页面*/
export const toPlanPage = (planName?: string) => {
  if (!planName) return '/plans/new';
  return '/plans/edit/' + planName;
};

/**跳转至流程列表页面*/
export const toPlanListPage = () => '/plans';

/**跳转至基础设置页面 */
export const toBaseSetting = (back?: string) => {
  return '/base-setting' + (back ? `?go=${back}` : '');
};
