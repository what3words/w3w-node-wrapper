import { AxiosResponse } from 'axios';
import type { Transport, TransportResponse } from './model';
import { ClientRequest } from '../client';
import { errorHandler } from './error';

export function axiosTransport(): Transport {
  // axios v0.x.x returns a function when imported via require (which is the expected behaviour)
  // while axios v1.x.x returns an object when imported via require
  const axios = require('axios');
  const transporter = axios.default || axios;
  return async function axiosTransporter<T>(
    req: ClientRequest
  ): Promise<TransportResponse<T>> {
    const params = req.query || {};
    if (req.format) params.format = req.format;
    const options = {
      ...req,
      baseURL: req.host,
      url: req.url,
      params,
    };
    return (
      transporter(options)
        .then((res: AxiosResponse) => {
          const { status, statusText, data: body, headers } = res;
          const response = errorHandler({
            status,
            statusText,
            body,
            headers: headers as Record<string, string>,
          });
          return response;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) => {
          if (err.isAxiosError) {
            const { response, status, statusText } = err;
            errorHandler<T>({
              status: response?.status || status || 500,
              statusText: response?.statusText || statusText,
              headers: response?.headers,
            });
          }
          throw err;
        })
    );
  };
}
