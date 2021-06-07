import {
  LocationGeoJsonResponse,
  LocationJsonResponse,
  RequestOptions,
  ResponseFormat,
} from '../types';
import { fetchGet } from '../fetch';

const convertToCoordinatesBase = <T>(
  words: string,
  format?: ResponseFormat,
  signal?: AbortSignal
): Promise<T> => {
  const requestOptions: RequestOptions = { words };

  if (format !== undefined) {
    requestOptions['format'] = format;
  }
  return fetchGet('convert-to-coordinates', requestOptions, signal);
};

export const convertToCoordinates = (
  words: string,
  signal?: AbortSignal
): Promise<LocationJsonResponse> =>
  convertToCoordinatesBase<LocationJsonResponse>(words, 'json', signal);

export const convertToCoordinatesGeoJson = (
  words: string,
  signal?: AbortSignal
): Promise<LocationGeoJsonResponse> =>
  convertToCoordinatesBase<LocationGeoJsonResponse>(words, 'geojson', signal);
