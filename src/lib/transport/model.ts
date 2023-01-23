import {
  AutosuggestResponse,
  AvailableLanguagesResponse,
  FeatureCollectionResponse,
  GridSectionGeoJsonResponse,
  GridSectionJsonResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from 'client';
import { ClientRequest } from '../client';

export type Transport = <
  T =
    | AutosuggestResponse
    | AvailableLanguagesResponse
    | LocationJsonResponse
    | GridSectionJsonResponse
    | FeatureCollectionResponse<LocationGeoJsonResponse>
    | FeatureCollectionResponse<GridSectionGeoJsonResponse>
    | string
    | null
>(
  req: ClientRequest
) => Promise<TransportResponse<T>>;
export interface TransportResponse<T> {
  status: number;
  statusText?: string;
  body?: T | null;
  headers?: { [key: string]: string };
}
