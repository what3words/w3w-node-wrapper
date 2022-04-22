import { Chance } from 'chance';

const CHANCE = new Chance();

export function generateAutosuggestSuggestion() {
  return {
    words: `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`,
    country: CHANCE.country(),
    nearestPlace: CHANCE.address(),
    language: CHANCE.locale(),
    rank: 2,
    distanceToFocusKm: CHANCE.natural(),
  };
}

export function generateCoordinate() {
  return { lat: CHANCE.latitude(), lng: CHANCE.longitude() };
}

export function generateRandomDigit() {
  return CHANCE.string({
    length: 1,
    alpha: false,
    numeric: true,
    symbols: false,
    casing: 'lower',
  });
}
