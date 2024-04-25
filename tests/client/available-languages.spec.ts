import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  AvailableLanguagesClient,
  HEADERS,
  Transport,
} from '@/.';
import type { Mock } from 'vitest';

const CHANCE = new Chance();

describe('Available Languages Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: Mock;
  let transport: Transport;
  let client: AvailableLanguagesClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    config = { host, apiVersion };
    transportSpy = vi.fn();
    transport = async (...args) => {
      transportSpy(...args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200, body: {} as any };
    };
    client = AvailableLanguagesClient.init(apiKey, config, transport);
  });

  it('should return instantiate an Available Languages Client instance', () => {
    expect(client).toBeInstanceOf(AvailableLanguagesClient);
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
    const defaultConfig = { host, apiVersion };
    const config = {
      host: CHANCE.url(),
      apiVersion: CHANCE.pickone([ApiVersion.Version2, ApiVersion.Version3]),
      headers: {},
    };
    expect(client.config()).toEqual(defaultConfig);
    expect(client.config(config)).toEqual(client);
    expect(client.config()).toEqual(config);
  });
  it('should call /available-languages when run is called', async () => {
    const transportArguments = {
      method: 'get',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/available-languages',
      query: { key: apiKey },
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };
    await client.run();
    expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
  });
});
