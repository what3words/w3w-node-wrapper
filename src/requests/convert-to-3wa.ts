import {
  Coordinates,
  LocationGeoJsonResponse,
  LocationJsonResponse,
  RequestOptions,
  ResponseFormat,
} from '../types';
import { coordinatesToString } from '../utils';
import { fetchGet } from '../fetch';

const convertTo3waBase = <T>(
  coordinates: Coordinates,
  language?: string,
  format?: ResponseFormat,
  signal?: AbortSignal
): Promise<T> => {
  const requestOptions: RequestOptions = {
    coordinates: coordinatesToString(coordinates),
  };
  if (language !== undefined) {
    requestOptions['language'] = language;
  }
  if (format !== undefined) {
    requestOptions['format'] = format;
  }

  return fetchGet('convert-to-3wa', requestOptions, signal);
};

export const convertTo3wa = (
  coordinates: Coordinates,
  language?: string,
  signal?: AbortSignal
): Promise<LocationJsonResponse> =>
  convertTo3waBase<LocationJsonResponse>(coordinates, language, 'json', signal);

export const convertTo3waGeoJson = (
  coordinates: Coordinates,
  language?: string,
  signal?: AbortSignal
): Promise<LocationGeoJsonResponse> =>
  convertTo3waBase<LocationGeoJsonResponse>(
    coordinates,
    language,
    'geojson',
    signal
  );
