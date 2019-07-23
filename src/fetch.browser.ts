import { ErrorResponse } from "./types";
import { GLOBAL_OPTIONS, searchParams } from "./utils";
import { version } from "./version";

export const fetchGet = <T>(
  url: string,
  data: { [x: string]: string } = {},
  signal?: AbortSignal
): Promise<T> => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      'X-W3W-Wrapper': `what3words-JavaScript/${version} (${navigator.userAgent})`,
    }
  };

  if (signal !== undefined) {
    options.signal = signal;
  }

  if (typeof GLOBAL_OPTIONS.key === "string" && GLOBAL_OPTIONS.key.length > 0) {
    data["key"] = GLOBAL_OPTIONS.key;
  }

  let hasError = false;
  return fetch(
    `${GLOBAL_OPTIONS.baseUrl}/${url}?${searchParams(data)}`,
    options
  )
    .then(response => {
      hasError = !response.ok;
      return response.json();
    })
    .then(data => {
      if (hasError) {
        throw (data as ErrorResponse).error;
      }
      return data;
    });
};
