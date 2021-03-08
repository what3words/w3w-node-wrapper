export { W3W_REGEX } from './constants'
export { autosuggest, AutosuggestOptions, AutosuggestResponse } from "./requests/autosuggest";
export { autosuggestSelection } from "./requests/autosuggest-selection";
export { availableLanguages, AvailableLanguagesResponse } from "./requests/available-languages";
export { convertTo3wa, convertTo3waGeoJson } from "./requests/convert-to-3wa";
export {
  convertToCoordinates,
  convertToCoordinatesGeoJson,
} from "./requests/convert-to-coordinates";
export {
  gridSection,
  gridSectionGeoJson,
  GridSectionGeoJsonResponse,
  GridSectionJsonResponse,
} from "./requests/grid-section";
export {
  Bounds,
  Coordinates,
  LocationJsonResponse,
  LocationGeoJsonResponse,
  LocationProperties,
  ResponseFormat,
} from './types'
export { setOptions, getOptions, ApiOptions, getWords, valid3wa } from "./utils";
