import { ErrorResponse } from "./types";
import { GLOBAL_OPTIONS, searchParams } from "./utils";
import axios, { AxiosError } from "axios";
import { version } from "./version";
import * as os from 'os';

const platform = (platform => {
  switch(platform) {
    case 'darwin':
      return 'Mac OS X';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return "";
  }
})(os.platform());

export const fetchGet = <T>(
  url: string,
  data: { [x: string]: string } = {},
  signal: any = null
): Promise<T> => {
  return new Promise<T>((resolve, error) => {
    if (
      typeof GLOBAL_OPTIONS.key === "string" &&
      GLOBAL_OPTIONS.key.length > 0
    ) {
      data["key"] = GLOBAL_OPTIONS.key;
    }

    axios.request<T>({
        url: `${GLOBAL_OPTIONS.baseUrl}/${url}?${searchParams(data)}`,
        headers: {'X-W3W-Wrapper': `what3words-Node/${version} (Node ${process.version}; ${platform} ${os.release()})`}
      })
      .then((response) => {
        if (response && response.status) {
          if (response.status >= 400) {
            // @ts-ignore
            error((response.data as ErrorResponse).error);
          }
        }
        resolve(response.data);
      }).catch((data: AxiosError) => {
        if (data.response) {
          error(data.response.data);
        } else {
          error(data.message);
        }
      });
  });
};
