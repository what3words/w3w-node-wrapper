import type { Coordinates, Bounds } from '../client';

export function searchParams(data: {
  [x: string]: string | boolean | number;
}): string {
  return Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}
export function coordinatesToString(
  coordinates: Coordinates,
  ordered = false
): string {
  if (ordered) {
    if (coordinates.lat < coordinates.lng)
      return `${coordinates.lng},${coordinates.lat}`;
  }
  return `${coordinates.lat},${coordinates.lng}`;
}
export function boundsToString(bounds: Bounds, ordered = true): string {
  return `${coordinatesToString(
    bounds.southwest,
    ordered
  )},${coordinatesToString(bounds.northeast, ordered)}`;
}
export function arrayToString(array: Array<number | string | boolean>): string {
  return array.join(',');
}
export function getPlatform(platform: string) {
  switch (platform) {
    case 'darwin':
      return 'Mac OS X';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return '';
  }
}
