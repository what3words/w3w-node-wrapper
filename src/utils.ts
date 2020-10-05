import { Bounds, Coordinates } from "./types";

interface ApiOptions {
  key?: string;
  baseUrl?: string;
  headers?: {[x:string]: string}
}

export let GLOBAL_OPTIONS: ApiOptions = {
  key: "",
  baseUrl: "https://api.what3words.com/v3"
};

export const searchParams = (data: { [x: string]: string }): string =>
  Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");

export const coordinatesToString = (coordinates: Coordinates): string =>
  `${coordinates.lat},${coordinates.lng}`;

export const boundsToString = (bounds: Bounds): string =>
  `${coordinatesToString(bounds.southwest)},${coordinatesToString(
    bounds.northeast
  )}`;

export const arrayToString = (array: number[] | string[]): string =>
  array.join(",");

export const setOptions = (options: ApiOptions): void => {
  GLOBAL_OPTIONS = { ...GLOBAL_OPTIONS, ...options };
};

export const getOptions = (): ApiOptions => GLOBAL_OPTIONS;

export const getPlatform = (platform: string) => {
  switch(platform) {
    case 'darwin':
      return 'Mac OS X';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return "";
  }
};
