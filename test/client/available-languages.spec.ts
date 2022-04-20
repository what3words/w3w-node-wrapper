import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  AvailableLanguagesClient,
  HEADERS,
} from '../../src';

const CHANCE = new Chance();

describe('Available Languages Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: jest.Mock<Promise<{ status: number; body: never }>, never>;
  let client: AvailableLanguagesClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    config = { host, apiVersion };
    transportSpy = jest.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (..._args: never): Promise<{ status: number; body: never }> => ({
        status: 200,
        body: {} as never,
      })
    );
    client = AvailableLanguagesClient.init(apiKey, config, transportSpy);
  });

  it('should return instantiate an Available Languages Client instance', () => {
    expect(client).toBeInstanceOf(AvailableLanguagesClient);
    const properties = [
      '_apiKey',
      'apiKey',
      '_config',
      'config',
      'run',
      'transport',
    ];
    properties.forEach(property => expect(client).toHaveProperty(property));
    expect(typeof client['_apiKey']).toEqual('string');
    expect(client['_apiKey']).toEqual(apiKey);
    expect(typeof client['_config']).toBe('object');
    expect(client['_config']).toEqual(config);
    expect(typeof client.apiKey).toBe('function');
    expect(typeof client.config).toBe('function');
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
