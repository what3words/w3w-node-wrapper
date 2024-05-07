import type { Transport, TransportResponse } from './model';
import { ClientRequest } from '../client';
import { errorHandler } from './error';
import { searchParams } from '../serializer';

export function fetchTransport(): Transport {
  const transporter = require('cross-fetch');
  return async function fetchTransporter<T>(
    req: ClientRequest
  ): Promise<TransportResponse<T>> {
    const { format, method, headers, body } = req ?? {};
    const url = `${req.host}${req.url}`;
    const query = req.query || {};
    if (format) query.format = format;
    const queryParams = searchParams(query);
    const fullPath = `${url}${queryParams.length > 0 ? `?${queryParams}` : ''}`;
    return transporter(fullPath, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    }).then((response: Response) =>
      toTransportResponse<T>(response).then(res => errorHandler<T>(res))
    );
  };
}

async function toTransportResponse<T>(
  res: Response
): Promise<TransportResponse<T>> {
  const body = res.headers.get('content-type')?.includes('application/json')
    ? res.json()
    : res.text();
  return body.then(data => {
    const headers: { [key: string]: string } = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      status: res.status,
      statusText: res.statusText,
      body: data,
      headers,
    };
  });
}
