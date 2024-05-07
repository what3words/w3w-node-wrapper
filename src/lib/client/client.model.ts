export enum ApiVersion {
  Version1 = 'v1',
  Version2 = 'v2',
  Version3 = 'v3',
}
export interface ApiClientConfiguration {
  apiVersion?: ApiVersion;
  host?: string;
  headers?: { [key: string]: string };
  utilisation?: string;
  sessionId?: string;
}

export interface RequestParams {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any> | null;
}

export interface ClientRequest extends RequestParams {
  method: 'get' | 'post';
  host: string;
  url: string;
  format?: 'json' | 'geojson';
}
