import { languages } from './languages/language-codes';
import { W3W_REGEX } from './constants';

/**
 * @deprecated since version 5.1.1. Use `Autosuggest.isValid3wa` instead
 */
export function valid3wa(value: string): boolean {
  return W3W_REGEX.test(value);
}

export function validLanguage(languageCode: string): boolean {
  return languages.includes(languageCode.toLowerCase());
}
