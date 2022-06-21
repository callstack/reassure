import { compare } from '@reassure/reassure-compare';

export const command = 'compare';
export const describe = 'compares gathered baseline and current measurements';

export function handler() {
  compare({});
}
