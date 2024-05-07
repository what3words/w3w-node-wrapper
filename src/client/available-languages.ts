import { ApiClient } from '../lib';
import type { ApiClientConfiguration, Transport } from '../lib';
import { UtilisationFn } from '../lib/utilisation';

export interface AvailableLanguagesResponse {
  languages: {
    code: string;
    name: string;
    nativeName: string;
  }[];
}

export class AvailableLanguagesClient extends ApiClient<AvailableLanguagesResponse> {
  protected readonly method = 'get';
  protected readonly url = '/available-languages';
  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport,
    utilisation?: UtilisationFn
  ): AvailableLanguagesClient {
    return new AvailableLanguagesClient(apiKey, config, transport, utilisation);
  }
}
