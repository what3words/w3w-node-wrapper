import { Bounds, Coordinates, RequestOptions, ResponseFormat } from "../types";
import { boundsToString } from "../utils";
import { fetchGet } from "../fetch";

interface GridSectionJsonResponse {
  lines: {
    start: Coordinates;
    end: Coordinates;
  }[];
}
interface GridSectionGeoJsonResponse {
  geometry: {
    coordinates: [number, number][][];
    type: "MultiLineString";
  };
  type: "Feature";
  properties: {};
}

const gridSectionBase = <T>(
  boundingBox: Bounds,
  format?: ResponseFormat,
  signal?: AbortSignal
): Promise<T> => {
  const requestOptions: RequestOptions = {
    "bounding-box": boundsToString(boundingBox)
  };

  if (format !== undefined) {
    requestOptions["format"] = format;
  }
  return fetchGet("grid-section", requestOptions, signal);
};

export const gridSection = (
  boundingBox: Bounds,
  signal?: AbortSignal
): Promise<GridSectionJsonResponse> =>
  gridSectionBase<GridSectionJsonResponse>(boundingBox, "json", signal);

export const gridSectionGeoJson = (
  bbox: Bounds,
  signal?: AbortSignal
): Promise<GridSectionGeoJsonResponse> =>
  gridSectionBase<GridSectionGeoJsonResponse>(bbox, "geojson", signal);
