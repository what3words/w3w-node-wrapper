export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
export type ResponseFormat = 'json' | 'geojson';
export interface Coordinates {
  lat: number;
  lng: number;
}
export interface Bounds {
  southwest: Coordinates;
  northeast: Coordinates;
}
export interface LocationProperties {
  country: string;
  nearestPlace: string;
  words: string;
  language: string;
  map: string;
}
export interface LocationJsonResponse extends LocationProperties {
  coordinates: Coordinates;
  square: Bounds;
}
export interface LocationGeoJsonResponse {
  bbox: [number, number, number, number];
  geometry: {
    coordinates: number[];
    type: string;
  };
  type: string;
  properties: LocationProperties;
}
export interface RequestOptions {
  [x: string]: string;
}

export interface FeatureCollectionResponse<LocationResponse> {
  features: LocationResponse[];
  type: 'FeatureCollection';
}
