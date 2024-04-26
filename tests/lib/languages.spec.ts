import { Chance } from 'chance';
import { baseLanguageCodeForISO6391 } from '@/.';

const CHANCE = new Chance();

const AVAILABLE_LANGUAGES = ['en-GB', 'de-DE', 'it-IT', 'es-ES', 'fr-FR'];

describe('baseLanguageCodeForISO6391', () => {
  it('should return base language code for valid ISO 639-1 language code', () => {
    const languageCode = CHANCE.pickone(AVAILABLE_LANGUAGES);
    console.log('LANG', languageCode);
    expect(baseLanguageCodeForISO6391(languageCode)).toEqual(
      languageCode.substring(0, 2)
    );
  });

  it('should allow case insensitive language code', () => {
    const languageCode = CHANCE.pickone(AVAILABLE_LANGUAGES);
    expect(baseLanguageCodeForISO6391(languageCode.toUpperCase())).toEqual(
      languageCode.substring(0, 2)
    );
  });

  it('should return undefined if invalid language code is provided', () => {
    const invalidLanguageCode = CHANCE.string({ length: 8 });
    expect(baseLanguageCodeForISO6391(invalidLanguageCode)).toBeUndefined();
  });

  it('should return undefined if language code is valid but not supported by the public API', () => {
    const unsupportedLanguageCode = 'xx-XX';
    expect(baseLanguageCodeForISO6391(unsupportedLanguageCode)).toBeUndefined();
  });
});
