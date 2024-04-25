import nock from 'nock';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  AutosuggestClient,
  AutosuggestInputType,
  HEADERS,
  Transport,
} from '@/index';
import {
  generateAutosuggestSuggestion,
  generateCoordinate,
} from '@mocks/fixtures';
import { languages } from '@/lib/languages/language-codes';
import type { Mock } from 'vitest';

const CHANCE = new Chance();

describe('Autosuggest Client', () => {
  describe('init()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      config = { host, apiVersion, headers: {} };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should return the api key when called with no parameter', () => {
      expect(client.apiKey()).toEqual(apiKey);
    });

    it('should set the api key when called with value', () => {
      const _apiKey = CHANCE.string({ length: 8 });
      expect(client.apiKey()).toEqual(apiKey);
      expect(client.apiKey(_apiKey)).toEqual(client);
      expect(client.apiKey()).toEqual(_apiKey);
    });
  });

  describe('config()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      config = { host, apiVersion, headers: {} };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should return the config when called with no parameter', () => {
      expect(client.config()).toEqual(config);
    });

    it('should set the config when called with value', () => {
      const defaultConfig = { host, apiVersion, headers: {} };
      const config = {
        host: CHANCE.url(),
        apiVersion: CHANCE.pickone([ApiVersion.Version2, ApiVersion.Version3]),
        headers: {},
      };
      expect(client.config()).toEqual(defaultConfig);
      expect(client.config(config)).toEqual(client);
      expect(client.config()).toEqual(config);
    });
  });
});
