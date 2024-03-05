import 'should';
import { Chance } from 'chance';
import { baseLanguageCodeForISO6391 } from '../../src';

const CHANCE = new Chance();
const ISO6391_LANGUAGES = [
  'it-IT',
  'en-GB',
  'zh-CN',
  'pt-BR',
  'es-ES',
  'fr-FR',
  'de-DE',
];
describe('baseLanguageCodeForISO6391', () => {
  it('should return base language code for valid ISO 639-1 language code', () => {
    const languageCode = CHANCE.pickone(ISO6391_LANGUAGES);
    baseLanguageCodeForISO6391(languageCode)?.should.be.equal(
      languageCode.substring(0, 2)
    );
  });

  it('should allow case insensitive language code', () => {
    const languageCode = CHANCE.pickone(ISO6391_LANGUAGES);
    baseLanguageCodeForISO6391(languageCode.toUpperCase())?.should.be.equal(
      languageCode.substring(0, 2)
    );
  });

  it('should return undefined if invalid language code is provided', () => {
    const invalidLanguageCode = CHANCE.string({ length: 8 });
    baseLanguageCodeForISO6391(invalidLanguageCode)?.should.be.undefined();
  });

  it('should return undefined if language code is valid but not supported by the public API', () => {
    const unsupportedLanguageCode = 'xx-XX';
    baseLanguageCodeForISO6391(unsupportedLanguageCode)?.should.be.undefined();
  });
});
