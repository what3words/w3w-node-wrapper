import type { ApiClientConfiguration, Transport } from '../lib';
import {
  ApiClient,
  arrayToString,
  boundsToString,
  coordinatesToString,
  validLanguage,
} from '../lib';

import type { Bounds, Coordinates } from './response.model';

export interface AutosuggestSuggestion {
  country: string;
  nearestPlace: string;
  words: string;
  distanceToFocusKm: number;
  rank: number;
  language: string;
}
export interface AutosuggestResponse {
  suggestions: AutosuggestSuggestion[];
}
export enum AutosuggestInputType {
  Text = 'text',
  VoconHybrid = 'vocon-hybrid',
  NMDP_ASR = 'nmdp-asr',
  GenericVoice = 'generic-voice',
}

export interface AutosuggestOptions {
  input: string;
  nResults?: number;
  focus?: Coordinates;
  nFocusResults?: number;
  clipToCountry?: string[];
  clipToBoundingBox?: Bounds;
  clipToCircle?: { center: Coordinates; radius: number };
  clipToPolygon?: Coordinates[];
  inputType?: AutosuggestInputType;
  language?: string;
  preferLand?: boolean;
}

export class AutosuggestClient extends ApiClient<
  AutosuggestResponse,
  AutosuggestOptions
> {
  private lastReqOpts: AutosuggestOptions = { input: '' };
  protected readonly url = '/autosuggest';
  protected readonly method = 'get';

  public static init(
    apiKey?: string,
    config?: ApiClientConfiguration,
    transport?: Transport
  ): AutosuggestClient {
    return new AutosuggestClient(apiKey, config, transport);
  }

  protected query(options: AutosuggestOptions) {
    this.lastReqOpts = options;
    return {
      ...this.autosuggestOptionsToQuery(options),
      input: options.input,
    };
  }

  protected async validate(options: AutosuggestOptions) {
    const textOptions = [AutosuggestInputType.Text];
    const speechOptions = [
      AutosuggestInputType.GenericVoice,
      AutosuggestInputType.NMDP_ASR,
      AutosuggestInputType.VoconHybrid,
    ];
    let valid = !!options;
    let message: string | undefined = undefined;

    if (!valid) {
      message = 'You must provide at least options.input';
      return { valid, message };
    }
    if (options.input.length < 1) {
      valid = false;
      message = 'You must specify an input value';
    }
    if (options.clipToCountry?.filter(country => country.length > 2)?.length) {
      valid = false;
      message =
        'Invalid clip to country. All values must be an ISO 3166-1 alpha-2 country code';
    }
    if (
      options.clipToBoundingBox &&
      (options.clipToBoundingBox.southwest.lat >
        options.clipToBoundingBox.northeast.lat ||
        options.clipToBoundingBox.southwest.lng >
          options.clipToBoundingBox.northeast.lng)
    ) {
      valid = false;
      message =
        'Southwest lat must be less than or equal to northeast lat and southwest lng must be less than or equal to northeast lng';
    }
    if (options.clipToPolygon) {
      if (
        !Array.isArray(options.clipToPolygon) ||
        options.clipToPolygon.length < 4 ||
        options.clipToPolygon.length > 25
      ) {
        valid = false;
        message =
          'Invalid clip to polygon value. Array must contain at least 4 coordinates and no more than 25';
      }
      const lastIndex = options.clipToPolygon.length - 1;
      if (
        options.clipToPolygon[0].lat !== options.clipToPolygon[lastIndex].lat ||
        options.clipToPolygon[0].lng !== options.clipToPolygon[lastIndex].lng
      ) {
        valid = false;
        message =
          'Invalid clip to polygon value. The polygon bounds must be closed.';
      }
    }
    if (options.inputType) {
      if (![...textOptions, ...speechOptions].includes(options.inputType)) {
        valid = false;
        message =
          'Invalid input type provided. Must provide a valid input type.';
      }
      if (
        options.language === undefined &&
        speechOptions.includes(options.inputType)
      ) {
        valid = false;
        message = 'You must provide language when using a speech input type';
      }
    }
    if (options.language && !validLanguage(options.language)) {
      valid = false;
      message =
        `The language ${options.language} is not supported. Refer to our API for supported languages.`;
    }
    return { valid, message };
  }

  public async onSelected(
    selected: AutosuggestSuggestion,
    initialRequestOptions: AutosuggestOptions = this.lastReqOpts
  ): Promise<void> {
    await this.makeClientRequest('get', '/autosuggest-selection', {
      query: {
        ...this.autosuggestOptionsToQuery(initialRequestOptions),
        'raw-input': initialRequestOptions.input,
        selection: selected.words,
        rank: `${selected.rank}`,
        ...(!initialRequestOptions.inputType
          ? { 'source-api': 'text' }
          : {
              'source-api':
                initialRequestOptions.inputType === AutosuggestInputType.Text
                  ? 'text'
                  : 'voice',
            }),
      },
    });
  }

  private autosuggestOptionsToQuery(options: AutosuggestOptions): {
    [key: string]: string;
  } {
    const requestOptions: { [key: string]: string } = {};
    if (options.nResults !== undefined) {
      requestOptions['n-results'] = options.nResults.toString();
    }
    if (options.focus !== undefined) {
      requestOptions['focus'] = coordinatesToString(options.focus);
    }
    if (options.nFocusResults !== undefined) {
      requestOptions['n-focus-results'] = options.nFocusResults.toString();
    }
    if (
      options.clipToCountry !== undefined &&
      Array.isArray(options.clipToCountry) &&
      options.clipToCountry.length > 0
    ) {
      requestOptions['clip-to-country'] = arrayToString(options.clipToCountry);
    }
    if (options.clipToBoundingBox !== undefined) {
      requestOptions['clip-to-bounding-box'] = boundsToString(
        options.clipToBoundingBox
      );
    }
    if (options.clipToCircle !== undefined) {
      requestOptions['clip-to-circle'] = `${coordinatesToString(
        options.clipToCircle.center
      )},${options.clipToCircle.radius}`;
    }
    if (options.clipToPolygon !== undefined) {
      requestOptions['clip-to-polygon'] = options.clipToPolygon
        .map(coord => coordinatesToString(coord))
        .join(',');
    }
    if (options.inputType !== undefined) {
      requestOptions['input-type'] = options.inputType;
    }
    if (options.language !== undefined) {
      requestOptions['language'] = options.language;
    }
    if (options.preferLand !== undefined) {
      requestOptions['prefer-land'] = options.preferLand.toString();
    }
    return requestOptions;
  }
}
