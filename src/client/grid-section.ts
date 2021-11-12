import { ApiClient, boundsToString } from '../lib';
import type { ApiClientConfiguration, Transport } from '../lib';
import type { Coordinates } from './response.model';

export interface GridSectionResponse {
  languages: {
    code: string;
    name: string;
    nativeName: string;
  }[];
}

export type GridSectionOptions = {
  boundingBox: { southwest: Coordinates; northeast: Coordinates };
  format?: 'json' | 'geojson';
};

export class GridSectionClient extends ApiClient<
  GridSectionResponse,
  GridSectionOptions
> {
  protected readonly method = 'get';
  protected readonly url = '/grid-section';

  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport
  ): GridSectionClient {
    return new GridSectionClient(apiKey, config, transport);
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
