import { ClientRequest } from '../client';

export type Transport = <T>(
  req: ClientRequest
) => Promise<TransportResponse<T>>;
export interface TransportResponse<T> {
  status: number;
  statusText?: string;
  body?: T | null;
  headers?: { [key: string]: string };
}
