import fetch from 'isomorphic-unfetch';
import type { Transport, TransportResponse } from './model';
import { ClientRequest } from '../client';
import { errorHandler } from './error';
import { searchParams } from '../serializer';

export function fetchTransport(): Transport {
  return async function fetchTransport<T>(
    req: ClientRequest
  ): Promise<TransportResponse<T>> {
    const url = `${req.host}${req.url}`;
    const query = req.query || {};
    if (req.format) query.format = req.format;
    const queryParams = searchParams(query);
    const fullPath = `${url}${queryParams.length > 0 ? `?${queryParams}` : ''}`;
    const response = await fetch(fullPath, {
      method: req.method,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : null,
    });
    const result = errorHandler<T>(await toTransportResponse<T>(response));
    return result;
  };
}

async function toTransportResponse<T>(
  res: Response
): Promise<TransportResponse<T>> {
  const headers: { [key: string]: string } = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return {
    status: res.status,
    statusText: res.statusText,
    body:
      res.headers.get('content-type') === 'application/json'
        ? await res.json()
        : await res.text(),
    headers,
  };
}
