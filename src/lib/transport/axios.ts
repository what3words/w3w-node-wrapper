import { AxiosResponse } from 'axios';
import type { Transport, TransportResponse } from './model';
import { ClientRequest } from '../client';
import { errorHandler } from './error';

export function axiosTransport(): Transport {
  const axios = require('axios');
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
    return await axios(options)
      .then((res: AxiosResponse) => {
        const response = errorHandler({
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          body: res.data,
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
