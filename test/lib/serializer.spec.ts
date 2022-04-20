import { Chance } from 'chance';
import {
  searchParams,
  coordinatesToString,
  boundsToString,
  arrayToString,
  getPlatform,
} from '../../src';
import { generateCoordinate } from '../fixtures';

const CHANCE = new Chance();

describe('searchParams()', () => {
  it('should serialize parameters', () => {
    const params = {
      foo: CHANCE.string(),
      bar: CHANCE.bool(),
      x: CHANCE.natural(),
    };
    const actual = searchParams(params);
    const expected = `foo=${encodeURIComponent(params.foo)}&bar=${
      params.bar
    }&x=${params.x}`;

    expect(actual).toEqual(expected);
  });
});

describe('coordinateToString()', () => {
  it('should serialize coordinates to a string (ordered)', () => {
    const coordinates = generateCoordinate();
    const ordered = true;
    const actual = coordinatesToString(coordinates, ordered);
    const expected =
      coordinates.lat < coordinates.lng
        ? `${coordinates.lng},${coordinates.lat}`
        : `${coordinates.lat},${coordinates.lng}`;

    expect(actual).toEqual(expected);
  });
  it('should serialize coordinates to a string (ordered) lat < lng', () => {
    const coordinates = { lat: 1, lng: 10 };
    const ordered = true;
    const actual = coordinatesToString(coordinates, ordered);
    const expected = `${coordinates.lng},${coordinates.lat}`;

    expect(actual).toEqual(expected);
  });
  it('should serialize coordinates to a string (unordered)', () => {
    const coordinates = generateCoordinate();
    const ordered = false;
    const actual = coordinatesToString(coordinates, ordered);
    const expected = `${coordinates.lat},${coordinates.lng}`;

    expect(actual).toEqual(expected);
  });
});

describe('arrayToString()', () => {
  it('should serialize an array to string', () => {
    const array = [CHANCE.word(), CHANCE.letter(), CHANCE.natural()];
    const actual = arrayToString(array);
    const expected = `${array[0]},${array[1]},${array[2]}`;

    expect(actual).toEqual(expected);
  });
});

describe('getPlatform()', () => {
  it('should serialize platform for darwin', () => {
    const platform = 'darwin';
    expect(getPlatform(platform)).toEqual('Mac OS X');
  });
  it('should serialize platform for win32', () => {
    const platform = 'win32';
    expect(getPlatform(platform)).toEqual('Windows');
  });
  it('should serialize platform for linux', () => {
    const platform = 'linux';
    expect(getPlatform(platform)).toEqual('Linux');
  });
  it('should serialize platform for non-matched value', () => {
    const platform = CHANCE.word();
    expect(getPlatform(platform)).toEqual('');
  });
});

describe('boundsToString()', () => {
  it('should serialize a bound to string (unordered)', () => {
    const bounds = {
      southwest: generateCoordinate(),
      northeast: generateCoordinate(),
    };
    const ordered = false;
    const actual = boundsToString(bounds, ordered);
    const expected = `${bounds.southwest.lat},${bounds.southwest.lng},${bounds.northeast.lat},${bounds.northeast.lng}`;

    expect(actual).toEqual(expected);
  });
  it('should serialize a bound to string (ordered)', () => {
    const bounds = {
      southwest: { lat: 1, lng: 5 },
      northeast: { lat: 12, lng: 4 },
    };
    const ordered = true;
    const actual = boundsToString(bounds, ordered);
    const expected = `${bounds.southwest.lng},${bounds.southwest.lat},${bounds.northeast.lat},${bounds.northeast.lng}`;

    expect(actual).toEqual(expected);
  });
});
