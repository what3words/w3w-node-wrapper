import { spy, SinonSpy } from 'sinon';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  ConvertTo3waClient,
  HEADERS,
  Transport,
} from '../../src';
import { generateCoordinate } from '../fixtures';

const CHANCE = new Chance();

describe('Convert to 3wa Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: SinonSpy;
  let transport: Transport;
  let client: ConvertTo3waClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    config = { host, apiVersion };
    transportSpy = spy();
    transport = async (...args) => {
      transportSpy(...args);
      return { status: 200, body: {} as never };
    };
    client = ConvertTo3waClient.init(apiKey, config, transport);
  });

  it('should return instantiate an Convert to 3wa Client instance', () => {
    expect(client).toBeInstanceOf(ConvertTo3waClient);
    const properties = [
      '_apiKey',
      'apiKey',
      '_config',
      'config',
      'run',
      'transport',
    ];
    properties.forEach(property => expect(client).toHaveProperty(property));
    expect(typeof client['_apiKey']).toBe('string');
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };
    await client.run({ coordinates, language, format });
    const actual = transportSpy.calledOnceWith(transportArguments);

    expect(actual).toEqual(true);
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };
    await client.run({ coordinates });
    const actual = transportSpy.calledOnceWith(transportArguments);

    expect(actual).toEqual(true);
  });
  it('should throw error when no coordinates are provided', async () => {
    try {
      await client.run(undefined as never);
    } catch (err) {
      expect(err.message).toEqual('No coordinates provided');
    } finally {
      expect(transportSpy.notCalled).toEqual(true);
    }
  });
});
