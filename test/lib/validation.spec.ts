import { Chance } from 'chance';
import { valid3wa } from '../../src';

const CHANCE = new Chance();

describe('valid3wa', () => {
  it('should return true if valid 3wa is provided', () => {
    const words = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    expect(valid3wa(words)).toEqual(true);
  });
  it.skip('should return true if valid 3wa is provided', () => {
    const words = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`;
    expect(valid3wa(words)).toEqual(true);
  });
  it('should return false if invalid 3wa is provided', () => {
    const words = `${CHANCE.word()}`;
    expect(valid3wa(words)).toEqual(false);
  });
  it('should return false if invalid 3wa is provided', () => {
    const words = String(CHANCE.bool());
    expect(valid3wa(words)).toEqual(false);
  });
});
