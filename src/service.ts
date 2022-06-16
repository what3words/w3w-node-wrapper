import {
  AutosuggestClient,
  AvailableLanguagesClient,
  ConvertTo3waClient,
  ConvertToCoordinatesClient,
  FeatureCollectionResponse,
  GridSectionClient,
} from './client';
import type {
  AutosuggestResponse,
  AutosuggestSuggestion,
  AutosuggestOptions,
  AvailableLanguagesResponse,
  ConvertTo3waOptions,
  ConvertToCoordinatesOptions,
  GridSectionOptions,
  GridSectionJsonResponse,
  GridSectionGeoJsonResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from './client';
import { ApiClientConfiguration } from './lib';
import type { Transport } from './lib';

export interface What3wordsService {
  clients: {
    autosuggest: AutosuggestClient;
    availableLanguages: AvailableLanguagesClient;
    convertTo3wa: ConvertTo3waClient;
    convertToCoordinates: ConvertToCoordinatesClient;
    gridSection: GridSectionClient;
  };
  setApiKey(key: string): void;
  setConfig(config: ApiClientConfiguration): void;
  autosuggest(options: AutosuggestOptions): Promise<AutosuggestResponse>;
  autosuggestSelection(options: AutosuggestSuggestion): Promise<void>;
  availableLanguages(): Promise<AvailableLanguagesResponse>;
  convertTo3wa(options: ConvertTo3waOptions): Promise<LocationJsonResponse>;
  convertTo3wa(
    options: ConvertTo3waOptions & { format?: 'json' }
  ): Promise<LocationJsonResponse>;
  convertTo3wa(
    options: ConvertTo3waOptions & { format: 'geojson' }
  ): Promise<FeatureCollectionResponse<LocationGeoJsonResponse>>;
  convertToCoordinates(
    options: ConvertToCoordinatesOptions
  ): Promise<LocationJsonResponse>;
  convertToCoordinates(
    options: ConvertToCoordinatesOptions & { format?: 'json' }
  ): Promise<LocationJsonResponse>;
  convertToCoordinates(
    options: ConvertToCoordinatesOptions & { format: 'geojson' }
  ): Promise<FeatureCollectionResponse<LocationGeoJsonResponse>>;
  gridSection(options: GridSectionOptions): Promise<GridSectionJsonResponse>;
  gridSection(
    options: GridSectionOptions & { format?: 'json' }
  ): Promise<GridSectionJsonResponse>;
  gridSection(
    options: GridSectionOptions & { format: 'geojson' }
  ): Promise<FeatureCollectionResponse<GridSectionGeoJsonResponse>>;
}

export function what3words(
  apiKey?: string,
  config?: ApiClientConfiguration,
  opts?: { transport: Transport }
): What3wordsService {
  const transport = opts?.transport || require('./lib').fetchTransport();
  const autosuggestClient = new AutosuggestClient(apiKey, config, transport);
  const availableLanguagesClient = new AvailableLanguagesClient(
    apiKey,
    config,
    transport
  );
  const convertTo3waClient = new ConvertTo3waClient(apiKey, config, transport);
  const convertToCoordinatesClient = new ConvertToCoordinatesClient(
    apiKey,
    config,
    transport
  );
  const gridSectionClient = new GridSectionClient(apiKey, config, transport);
  const service = {
    clients: {
      autosuggest: autosuggestClient,
      availableLanguages: availableLanguagesClient,
      convertTo3wa: convertTo3waClient,
      convertToCoordinates: convertToCoordinatesClient,
      gridSection: gridSectionClient,
    },
    setApiKey: (apiKey: string) => {
      autosuggestClient.apiKey(apiKey);
      availableLanguagesClient.apiKey(apiKey);
      convertTo3waClient.apiKey(apiKey);
      convertToCoordinatesClient.apiKey(apiKey);
      gridSectionClient.apiKey(apiKey);
    },
    setConfig: (config: ApiClientConfiguration) => {
      autosuggestClient.config(config);
      availableLanguagesClient.config(config);
      convertTo3waClient.config(config);
      convertToCoordinatesClient.config(config);
      gridSectionClient.config(config);
    },
    autosuggest: autosuggestClient.run.bind(autosuggestClient),
    autosuggestSelection: autosuggestClient.onSelected.bind(autosuggestClient),
    availableLanguages: availableLanguagesClient.run.bind(
      availableLanguagesClient
    ),
    convertTo3wa: convertTo3waClient.run.bind(convertTo3waClient),
    convertToCoordinates: convertToCoordinatesClient.run.bind(
      convertToCoordinatesClient
    ),
    gridSection: gridSectionClient.run.bind(gridSectionClient),
  };

  return service;
}
