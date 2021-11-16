import { generate } from 'short-uuid';
import { SPECIAL_TAG_MAP } from './template/constants';

export function handleSpecialVal(val: unknown) {
  let res = val;
  if (res === SPECIAL_TAG_MAP.random) {
    res = `r-${generate()}`;
  }
  return res;
}
