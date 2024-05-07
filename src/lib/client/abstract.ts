import {
  ApiClientConfiguration,
  ApiVersion,
  ClientRequest,
  RequestParams,
} from './client.model';
import {
  errorHandler,
  fetchTransport,
  Transport,
  TransportResponse,
} from '../transport';
import { utilisationFn, UtilisationFn } from '../utilisation';
import { HEADERS } from '../constants';
import { v4 } from 'uuid';

export abstract class ApiClient<
  JsonResponse,
  Params = undefined,
  GeoJsonResponse = JsonResponse
> {
  protected abstract url: string;
  protected abstract method: 'get' | 'post';
  protected _config: ApiClientConfiguration;
  private static DEFAULT_CONFIG = {
    host: 'https://api.what3words.com',
    utilisation: 'https://utilisation-api.what3words.com',
    apiVersion: ApiVersion.Version3,
  };
  private transport: Transport;
  private utilisation: UtilisationFn;

  constructor(
    private _apiKey: string = '',
    config: ApiClientConfiguration = {},
    transport: Transport = fetchTransport(),
    utilisation: UtilisationFn = utilisationFn
  ) {
    this._config = Object.assign({}, ApiClient.DEFAULT_CONFIG, config);
    this.transport = transport;
    this.utilisation = utilisation;
  }

  public apiKey(apiKey?: string): this | string {
    if (apiKey !== undefined) {
      this._apiKey = apiKey;
      return this;
    }
    return this._apiKey;
  }

  public config(
    config?: ApiClientConfiguration
  ): this | ApiClientConfiguration {
    if (config !== undefined) {
      this._config = Object.assign({}, this._config, config);
      return this;
    }
    return this._config;
  }

  public async run(
    options?: Params | (Params & { format?: 'json' })
  ): Promise<JsonResponse>;
  public async run(
    options: Params & { format: 'geojson' }
  ): Promise<GeoJsonResponse>;
  public async run(options?: Params): Promise<JsonResponse | GeoJsonResponse> {
    return this.validate(options)
      .then(validation => {
        if (!validation.valid) {
          throw new Error(
            validation.message ||
              'There was a problem validating your request options'
          );
        }

        const params = {
          headers: { ...this.headers(), ...(this._config.headers || {}) },
          body: this.body(options),
          query: this.query(options),
        };

        return this.makeClientRequest<JsonResponse | GeoJsonResponse>(
          this.method,
          this.url,
          params
        );
      })
      .then(({ body }) => {
        if (!body) throw new Error('No response body set');
        return body;
      });
  }

  protected async makeClientRequest<T>(
    method: 'get' | 'post',
    url: string,
    params?: RequestParams
  ): Promise<TransportResponse<T>> {
    const clientRequest = this.prepareClientRequest(method, url, params);
    const { headers, query, body } = clientRequest;
    // NOTE: This assumes that we should send utilisation data for each client request regardless if it's successful or not.
    this.sendUtilisation(url, { headers, query, body });
    return this.transport<T>(clientRequest).then(response => {
      return errorHandler(response);
    });
  }

  protected prepareClientRequest(
    method: 'get' | 'post',
    url: string,
    params?: RequestParams
  ): ClientRequest {
    const { body, headers, query } = params ?? {};
    return {
      method,
      host: `${this._config.host?.replace(/\/$/, '')}/${
        this._config.apiVersion
      }`,
      url,
      query: {
        ...(query || {}),
        key: this._apiKey,
      },
      headers: {
        ...(headers || {}),
        'X-Correlation-ID': this._config.sessionId ?? v4(),
        'X-Api-Key': this._apiKey,
        ...HEADERS,
      },
      body: body || null,
    };
  }

  /**
   * Sends data to utilisation-api (public api use only).
   * @param path - The path for the utilisation request.
   * @param params - Optional request parameters.
   * @returns A Promise that resolves to void.
   */
  private async sendUtilisation(
    path: string,
    params?: RequestParams
  ): Promise<void> {
    // const regex = new RegExp(
    //   ['localhost.*', '.*\\.what3words\\.com'].join('|')
    // );

    // if (!this._config.host || !regex.test(this._config.host)) {
    //   return;
    // }
    if (!this._config.host || !/.*\.what3words\.com/.test(this._config.host)) {
      return;
    }

    // Invoke the utilisation callback function to retrieve data to be sent to utilisation-api.
    // If this is null, then we simply don't return anything to the server.
    const utilisation = this.utilisation(path, params);
    if (!utilisation) {
      return;
    }
    this.transport<void>({
      method: 'post',
      host: `${this._config.utilisation?.replace(/\/$/, '')}`,
      url: '/autosuggest-session',
      ...utilisation,
    }).then(response => {
      // TODO: replace this with something else
      console.log('Response', response);
    });
  }

  protected async validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: Params
  ): Promise<{ valid: boolean; message?: string }> {
    return { valid: true, message: undefined };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected headers(options?: Params) {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected body(options?: Params) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected query(options?: Params) {
    return {};
  }
}
