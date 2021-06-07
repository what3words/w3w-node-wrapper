import { Bounds, Coordinates, RequestOptions } from '../types';
import { arrayToString, boundsToString, coordinatesToString } from '../utils';
import { fetchGet } from '../fetch';

export interface AutosuggestResponse {
  suggestions: {
    country: string;
    nearestPlace: string;
    words: string;
    distanceToFocusKm: number;
    rank: number;
    language: string;
  }[];
}
export interface AutosuggestOptions {
  nResults?: number;
  focus?: Coordinates;
  nFocusResults?: number;
  clipToCountry?: string[];
  clipToBoundingBox?: Bounds;
  clipToCircle?: { center: Coordinates; radius: number };
  clipToPolygon?: number[];
  inputType?: 'text' | 'vocon-hybrid' | 'nmdp-asr' | 'generic-voice';
  language?: string;
  preferLand?: boolean;
}
export function autosuggestOptionsToQuery(options?: AutosuggestOptions): {
  [key: string]: string;
} {
  const requestOptions: { [key: string]: string } = {};
  if (options !== undefined) {
    if (options.nResults !== undefined) {
      requestOptions['n-results'] = options.nResults.toString();
    }
    if (options.focus !== undefined) {
      requestOptions['focus'] = coordinatesToString(options.focus);
    }
    if (options.nFocusResults !== undefined) {
      requestOptions['n-focus-results'] = options.nFocusResults.toString();
    }
    if (
      options.clipToCountry !== undefined &&
      Array.isArray(options.clipToCountry) &&
      options.clipToCountry.length > 0
    ) {
      requestOptions['clip-to-country'] = arrayToString(options.clipToCountry);
    }
    if (options.clipToBoundingBox !== undefined) {
      requestOptions['clip-to-bounding-box'] = boundsToString(
        options.clipToBoundingBox
      );
    }
    if (options.clipToCircle !== undefined) {
      requestOptions['clip-to-circle'] = `${coordinatesToString(
        options.clipToCircle.center
      )},${options.clipToCircle.radius}`;
    }
    if (options.clipToPolygon !== undefined) {
      requestOptions['clip-to-polygon'] = arrayToString(options.clipToPolygon);
    }
    if (options.inputType !== undefined) {
      requestOptions['input-type'] = options.inputType;
    }
    if (options.language !== undefined) {
      requestOptions['language'] = options.language;
    }
    if (options.preferLand !== undefined) {
      requestOptions['prefer-land'] = options.preferLand.toString();
    }
  }
  return requestOptions;
}
export const autosuggest = (
  input: string,
  options?: AutosuggestOptions,
  signal?: AbortSignal
): Promise<AutosuggestResponse> => {
  const requestOptions: RequestOptions = {
    input,
    ...autosuggestOptionsToQuery(options),
  };
  return fetchGet('autosuggest', requestOptions, signal);
};
