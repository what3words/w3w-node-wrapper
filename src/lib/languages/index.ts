import { languages } from './language-codes';
/**
 * Retrieves the base language code that the public API supports for any given ISO 639-1 language code.
 * i.e.: zh-TW -> zh, pt-BR -> pt, en-GB -> en
 *
 * Note: this ignores cyrillic and latin languages (_cy and _la)
 * @param languageCode The language code to validate.
 * @returns the supported language code or undefined if not supported or if the language has invalid format (i.e. 'xxxx').
 *
 * @example
 *    baseLanguageCodeForISO6391('en-GB'); // 'en'
 *    baseLanguageCodeForISO6391('zh-CN'); // 'zh'
 *    baseLanguageCodeForISO6391('abcde'); // Error: 'Invalid language code - xxxx.'
 */
export function baseLanguageCodeForISO6391(languageCode: string) {
  // Undefined if the language code is invalid.
  if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(languageCode)) {
    return;
  }
  const language = languageCode.split('-').shift()?.toLowerCase();
  return languages.find((code: string) => language === code.toLowerCase());
}
