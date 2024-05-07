import { ApiClient } from '../lib';
import type { ApiClientConfiguration, Transport } from '../lib';
import { UtilisationFn } from '../lib/utilisation';
import type {
  Coordinates,
  FeatureCollectionResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from './response.model';

export type ConvertTo3waOptions = {
  coordinates: Coordinates;
  language?: string;
  format?: 'json' | 'geojson';
};

export class ConvertTo3waClient extends ApiClient<
  LocationJsonResponse,
  ConvertTo3waOptions,
  FeatureCollectionResponse<LocationGeoJsonResponse>
> {
  protected readonly method = 'get';
  protected readonly url = '/convert-to-3wa';

  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport,
    utilisation?: UtilisationFn
  ): ConvertTo3waClient {
    return new ConvertTo3waClient(apiKey, config, transport, utilisation);
  }

  protected query(options: ConvertTo3waOptions) {
    return {
      coordinates: `${options.coordinates.lat},${options.coordinates.lng}`,
      language: options.language || 'en',
      format: options.format || 'json',
    };
  }

  protected async validate(options: ConvertTo3waOptions) {
    if (!options?.coordinates) {
      return { valid: false, message: 'No coordinates provided' };
    }
    return { valid: true };
  }
}
