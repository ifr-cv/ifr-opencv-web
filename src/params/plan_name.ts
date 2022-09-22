import { planNameRegex } from '$def/Task';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return planNameRegex.test(param);
};
