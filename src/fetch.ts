import { ErrorResponse } from './types';
import { GLOBAL_OPTIONS, searchParams, getPlatform } from './utils';
import axios, { AxiosError } from 'axios';
import { version } from './version';
import * as os from 'os';

const platform = getPlatform(os.platform());

export const fetchGet = <T>(
  url: string,
  data: { [x: string]: string } = {},
  signal: any = null
): Promise<T> => {
  return new Promise<T>((resolve, error) => {
    let headers = {
      'X-W3W-Wrapper': `what3words-Node/${version} (Node ${
        process.version
      }; ${platform} ${os.release()})`,
    };

    if (
      typeof GLOBAL_OPTIONS.key === 'string' &&
      GLOBAL_OPTIONS.key.length > 0
    ) {
      data['key'] = GLOBAL_OPTIONS.key;
    }

    if (GLOBAL_OPTIONS.headers) {
      headers = { ...headers, ...GLOBAL_OPTIONS.headers };
    }

    axios
      .request<T>({
        url: `${GLOBAL_OPTIONS.baseUrl}/${url}?${searchParams(data)}`,
        headers,
      })
      .then(response => {
        if (response && response.status) {
          if (response.status >= 400) {
            error((response.data as any).error as ErrorResponse);
          }
        }
        resolve(response.data);
      })
      .catch((data: AxiosError) => {
        if (data.response) {
          error(data.response.data);
        } else {
          error(data.message);
        }
      });
  });
};
