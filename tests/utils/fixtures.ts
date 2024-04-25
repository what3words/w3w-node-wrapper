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
