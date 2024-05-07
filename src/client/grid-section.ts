import { ApiClient, boundsToString } from '../lib';
import type { ApiClientConfiguration, Transport } from '../lib';
import { UtilisationFn } from '../lib/utilisation';
import type { Coordinates, FeatureCollectionResponse } from './response.model';

export interface GridSectionJsonResponse {
  lines: {
    start: Coordinates;
    end: Coordinates;
  }[];
}
export interface GridSectionGeoJsonResponse {
  geometry: {
    coordinates: [number, number][][];
    type: 'MultiLineString';
  };
  type: 'Feature';
  properties: {};
}

export type GridSectionOptions = {
  boundingBox: { southwest: Coordinates; northeast: Coordinates };
  format?: 'json' | 'geojson';
};

export class GridSectionClient extends ApiClient<
  GridSectionJsonResponse,
  GridSectionOptions,
  FeatureCollectionResponse<GridSectionGeoJsonResponse>
> {
  protected readonly method = 'get';
  protected readonly url = '/grid-section';

  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport,
    utilisation?: UtilisationFn
  ): GridSectionClient {
    return new GridSectionClient(apiKey, config, transport, utilisation);
  }

  protected query(options: GridSectionOptions) {
    return {
      'bounding-box': boundsToString(options.boundingBox, false),
      format: options.format || 'json',
    };
  }

  protected async validate(options: GridSectionOptions) {
    if (!options?.boundingBox) {
      return { valid: false, message: 'No bounding box specified' };
    }
    if (
      options.boundingBox.northeast.lat < -90 ||
      options.boundingBox.northeast.lat > 90 ||
      options.boundingBox.southwest.lat < -90 ||
      options.boundingBox.southwest.lat > 90
    ) {
      return {
        valid: false,
        message: 'Invalid latitude provided. Latitude must be >= -90 and <= 90',
      };
    }
    return { valid: true };
  }
}
