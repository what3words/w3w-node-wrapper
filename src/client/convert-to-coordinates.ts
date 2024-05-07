import { ApiClient } from '../lib';
import type { ApiClientConfiguration, Transport } from '../lib';
import { UtilisationFn } from '../lib/utilisation';
import type {
  FeatureCollectionResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from './response.model';

export type ConvertToCoordinatesOptions = {
  words: string;
  format?: 'json' | 'geojson';
};

export class ConvertToCoordinatesClient extends ApiClient<
  LocationJsonResponse,
  ConvertToCoordinatesOptions,
  FeatureCollectionResponse<LocationGeoJsonResponse>
> {
  protected readonly method = 'get';
  protected readonly url = '/convert-to-coordinates';

  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport,
    utilisation?: UtilisationFn
  ): ConvertToCoordinatesClient {
    return new ConvertToCoordinatesClient(
      apiKey,
      config,
      transport,
      utilisation
    );
  }

  protected query(options: ConvertToCoordinatesOptions) {
    return {
      words: options.words,
      format: options.format || 'json',
    };
  }

  protected async validate(options: ConvertToCoordinatesOptions) {
    if (!options?.words) {
      return {
        valid: false,
        message: 'You must specify the words to convert to coordinates',
      };
    }
    return { valid: true };
  }
}
