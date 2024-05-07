import { Mock } from 'vitest';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  ConvertTo3waClient,
  HEADERS,
  Transport,
} from '@/.';
import { generateCoordinate } from '@utils/fixtures';

const CHANCE = new Chance();

describe('Convert to 3wa Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let utilisation: string;
  let sessionId: string;
  let config: ApiClientConfiguration;
  let transportSpy: Mock;
  let transport: Transport;
  let client: ConvertTo3waClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    utilisation = CHANCE.url({ path: '' });
    sessionId = CHANCE.guid();
    config = {
      host,
      apiVersion,
      utilisation,
      headers: {},
      sessionId,
    };
    transportSpy = vi.fn();
    transport = async (...args) => {
      transportSpy(...args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200, body: {} as any };
    };
    client = ConvertTo3waClient.init(apiKey, config, transport);
  });

  it('should return instantiate an Convert to 3wa Client instance', () => {
    expect(client).toBeInstanceOf(ConvertTo3waClient);
    expect(client).toHaveProperty('_apiKey');
    expect(client).toHaveProperty('apiKey');
    expect(client).toHaveProperty('_config');
    expect(client).toHaveProperty('config');
    expect(client).toHaveProperty('run');
    expect(client).toHaveProperty('transport');
    expectTypeOf(client['_apiKey']).toBeString();
    expect(client['_apiKey']).toEqual(apiKey);
    expectTypeOf(client['_config']).toBeObject();
    expect(client['_config']).toEqual(config);
    expectTypeOf(client.apiKey).toBeFunction();
    expectTypeOf(client.config).toBeFunction();
  });
  it('should return the api key when apiKey function is called with no parameter', () => {
    expect(client.apiKey()).toEqual(apiKey);
  });
  it('should set the api key when apiKey function is called with value', () => {
    const _apiKey = CHANCE.string({ length: 8 });
    expect(client.apiKey()).toEqual(apiKey);
    expect(client.apiKey(_apiKey)).toEqual(client);
    expect(client.apiKey()).toEqual(_apiKey);
  });
  it('should return the config when config function is called with no parameter', () => {
    expect(client.config()).toEqual(config);
  });
  it('should set the config when config function is called with value', () => {
    const defaultConfig = {
      host,
      apiVersion,
      utilisation,
      headers: {},
      sessionId,
    };
    const config = {
      host: CHANCE.url(),
      apiVersion: CHANCE.pickone([ApiVersion.Version2, ApiVersion.Version3]),
      headers: {},
      sessionId,
      utilisation: CHANCE.url(),
    };
    expect(client.config()).toEqual(defaultConfig);
    expect(client.config(config)).toEqual(client);
    expect(client.config()).toEqual(config);
  });
  it('should call /convert-to-3wa when run is called', async () => {
    const coordinates = generateCoordinate();
    const language = CHANCE.locale();
    const format = 'json';
    const transportArguments = {
      method: 'get',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/convert-to-3wa',
      query: {
        key: apiKey,
        language,
        coordinates: `${coordinates.lat},${coordinates.lng}`,
        format,
      },
      headers: {
        'X-Api-Key': apiKey,
        'X-Correlation-ID': sessionId,
        ...HEADERS,
      },
      body: null,
    };
    await client.run({ coordinates, language, format });
    expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
  });
  it('should call /convert-to-3wa when run is called (no format/language)', async () => {
    const coordinates = generateCoordinate();
    const transportArguments = {
      method: 'get',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/convert-to-3wa',
      query: {
        key: apiKey,
        language: 'en',
        coordinates: `${coordinates.lat},${coordinates.lng}`,
        format: 'json',
      },
      headers: {
        'X-Api-Key': apiKey,
        'X-Correlation-ID': sessionId,
        ...HEADERS,
      },
      body: null,
    };
    await client.run({ coordinates });
    expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
  });
  it('should throw error when no coordinates are provided', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.run(undefined as any);
    } catch (err) {
      expect(err.message).toEqual('No coordinates provided');
    } finally {
      expect(transportSpy).not.toHaveBeenCalled();
    }
  });
});
