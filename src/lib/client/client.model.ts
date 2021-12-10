export enum ApiVersion {
  Version1 = 'v1',
  Version2 = 'v2',
  Version3 = 'v3',
}
export interface ApiClientConfiguration {
  apiVersion?: ApiVersion;
  host?: string;
  headers?: { [key: string]: string };
}
export interface ClientRequest {
  method: 'get' | 'post';
  host: string;
  url: string;
  query?: { [key: string]: string };
  headers?: { [key: string]: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: { [key: string]: any } | null;
  format?: 'json' | 'geojson';
}
export type ExecFnResponse = [
  'get' | 'post',
  string,
  {
    headers?: { [key: string]: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: { [key: string]: any };
    query?: { [key: string]: string };
  }?
];
