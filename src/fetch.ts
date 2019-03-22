import { ErrorResponse } from "./types";
import { GLOBAL_OPTIONS, searchParams } from "./utils";
import { get } from "https";

export const fetchGet = <T>(
  url: string,
  data: { [x: string]: string } = {}
): Promise<T> => {
  return new Promise<T>((resolve, error) => {
    if (
      typeof GLOBAL_OPTIONS.key === "string" &&
      GLOBAL_OPTIONS.key.length > 0
    ) {
      data["key"] = GLOBAL_OPTIONS.key;
    }
    get(`${GLOBAL_OPTIONS.baseUrl}/${url}?${searchParams(data)}`, response => {
      let data = "";

      response.on("data", chunk => {
        data += chunk;
      });

      response.on("end", () => {
        const json = JSON.parse(data);
        if (response && response.statusCode) {
          if (response.statusCode >= 400) {
            error((json as ErrorResponse).error);
          }
        }
        resolve(json);
      });
    }).on("error", (data: Error) => {
      error(data);
    });
  });
};
