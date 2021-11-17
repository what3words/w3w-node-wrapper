import { W3W_REGEX } from './constants';

export function valid3wa(value: string): boolean {
  return W3W_REGEX.test(value);
}
