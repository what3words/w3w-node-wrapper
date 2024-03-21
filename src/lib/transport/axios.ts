import { AxiosResponse } from 'axios';
import type { Transport, TransportResponse } from './model';
import { ClientRequest } from '../client';
import { errorHandler } from './error';

export function axiosTransport(): Transport {
  // axios v0.x.x returns a function when imported via require (which is the expected behaviour)
  // while axios v1.x.x returns an object when imported via require
  const axios = require('axios');
  const transporter = axios.default || axios;
  return async function axiosTransport<T>(
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
    return await transporter(options)
      .then((res: AxiosResponse) => {
        const response = errorHandler({
          status: res.status,
          statusText: res.statusText,
          body: res.data,
          headers: res.headers as Record<string, string>,
        });
        return response;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        if (err.isAxiosError)
          errorHandler<T>({
            status: err.response?.status || err.status || 500,
            statusText: err.response?.statusText || err.statusText,
            headers: err.response?.headers,
          });
        throw err;
      });
  };
}
