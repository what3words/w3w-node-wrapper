import { ApiClientConfiguration, ApiVersion, HttpMethod } from './client.model';
import {
  errorHandler,
  Transport,
  TransportResponse,
  voidTransport,
} from '../transport';
import { HEADERS } from '../constants';

export abstract class ApiClient<Response, Params = undefined> {
  protected abstract url: string;
  protected abstract method: HttpMethod;
  private static DEFAULT_CONFIG = {
    host: 'https://api.what3words.com',
    apiVersion: ApiVersion.Version3,
  };
  private _config: ApiClientConfiguration;

  constructor(
    private _apiKey: string = '',
    config: ApiClientConfiguration = {},
    public transport: Transport = voidTransport()
  ) {
    this._config = Object.assign({}, ApiClient.DEFAULT_CONFIG, config);
  }

  public apiKey(apiKey?: string): this | string {
    if (apiKey !== undefined) {
      this._apiKey = apiKey;
      return this;
    }
    return this._apiKey;
  }

  public set config(config: ApiClientConfiguration) {
    this._config = Object.assign({}, this._config, config);
  }

  public get config(): ApiClientConfiguration {
    return this._config;
  }

  public async run(options?: Params): Promise<Response> {
    const validation = await this.validate(options);
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
    const response = await this.makeClientRequest<Response>(
      this.method,
      this.url,
      params
    );
    if (!response.body) throw new Error('No response body set');
    return response.body;
  }

  protected async makeClientRequest<T>(
    method: HttpMethod,
    url: string,
    params?: {
      headers?: { [key: string]: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body?: { [key: string]: any } | null;
      query?: { [key: string]: string };
    }
  ): Promise<TransportResponse<T>> {
    const clientRequest = this.getClientRequest(method, url, params);
    const response = await this.transport<T>(clientRequest);
    const result = await errorHandler(response);
    return result;
  }

  protected getClientRequest(
    method: HttpMethod,
    url: string,
    params?: {
      headers?: { [key: string]: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body?: { [key: string]: any } | null;
      query?: { [key: string]: string };
    }
  ) {
    return {
      method,
      host: `${this._config.host?.replace(/\/$/, '')}/${
        this._config.apiVersion
      }`,
      url,
      query: {
        ...(params?.query || {}),
        key: this._apiKey,
      },
      headers: {
        ...(params?.headers || {}),
        'X-Api-Key': this._apiKey,
        ...HEADERS,
      },
      body: params?.body || null,
    };
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
