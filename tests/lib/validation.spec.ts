import { Chance } from 'chance';
import { valid3wa, validLanguage } from '@/.';
import { languages } from '@/lib/languages/language-codes';

const CHANCE = new Chance();

describe('validation', () => {
  describe('valid3wa', () => {
    it('should return true if valid 3wa is provided', () => {
      const words = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      expect(valid3wa(words)).toBeTruthy();
    });
    it.skip('should return true if valid 3wa is provided', () => {
      const words = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`;
      expect(valid3wa(words)).toBeTruthy();
    });
    it('should return false if invalid 3wa is provided', () => {
      const words = `${CHANCE.word()}`;
      expect(valid3wa(words)).toBeFalsy();
    });
    it('should return false if invalid 3wa is provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const words = CHANCE.bool() as any;
      expect(valid3wa(words)).toBeFalsy();
    });
  });
  describe('validLanguage', () => {
    it('should return true if valid language code is provided', () => {
      const languageCode = CHANCE.pickone(languages);
      expect(validLanguage(languageCode)).toBeTruthy();
    });
    it('should return false if invalid language code is provided', () => {
      const languageCode = 'xx';
      expect(validLanguage(languageCode)).toBeFalsy();
    });
  });
});
