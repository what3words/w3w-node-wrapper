import { Chance } from 'chance';
import {
  searchParams,
  coordinatesToString,
  boundsToString,
  arrayToString,
  getPlatform,
} from '@/.';
import { generateCoordinate } from '@utils/fixtures';

const CHANCE = new Chance();

describe('searchParams()', () => {
  it('should serialize parameters', () => {
    const params = {
      foo: CHANCE.string(),
      bar: CHANCE.bool(),
      x: CHANCE.natural(),
    };
    expect(searchParams(params)).toEqual(
      `foo=${encodeURIComponent(params.foo)}&bar=${params.bar}&x=${params.x}`
    );
  });
});

describe('coordinateToString()', () => {
  it('should serialize coordinates to a string (ordered)', () => {
    const coordinates = generateCoordinate();
    const ordered = true;
    expect(coordinatesToString(coordinates, ordered)).toEqual(
      coordinates.lat < coordinates.lng
        ? `${coordinates.lng},${coordinates.lat}`
        : `${coordinates.lat},${coordinates.lng}`
    );
  });
  it('should serialize coordinates to a string (ordered) lat < lng', () => {
    const coordinates = { lat: 1, lng: 10 };
    const ordered = true;
    expect(coordinatesToString(coordinates, ordered)).toEqual(
      `${coordinates.lng},${coordinates.lat}`
    );
  });
  it('should serialize coordinates to a string (unordered)', () => {
    const coordinates = generateCoordinate();
    const ordered = false;
    expect(coordinatesToString(coordinates, ordered)).toEqual(
      `${coordinates.lat},${coordinates.lng}`
    );
  });
});

describe('arrayToString()', () => {
  it('should serialize an array to string', () => {
    const array = [CHANCE.word(), CHANCE.letter(), CHANCE.natural()];
    expect(arrayToString(array)).toEqual(`${array[0]},${array[1]},${array[2]}`);
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
    expect(boundsToString(bounds, ordered)).toEqual(
      `${bounds.southwest.lat},${bounds.southwest.lng},${bounds.northeast.lat},${bounds.northeast.lng}`
    );
  });
  it('should serialize a bound to string (ordered)', () => {
    const bounds = {
      southwest: { lat: 1, lng: 5 },
      northeast: { lat: 12, lng: 4 },
    };
    const ordered = true;
    expect(boundsToString(bounds, ordered)).toEqual(
      `${bounds.southwest.lng},${bounds.southwest.lat},${bounds.northeast.lat},${bounds.northeast.lng}`
    );
  });
});
