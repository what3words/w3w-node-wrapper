import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  GridSectionClient,
  HEADERS,
} from '../../src';
import { generateCoordinate } from '../fixtures';

const CHANCE = new Chance();

describe('Grid Section Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: jest.Mock<Promise<{ status: number; body: never }>, never>;
  let client: GridSectionClient;

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
    client = GridSectionClient.init(apiKey, config, transportSpy);
  });

  it('should return instantiate an Grid Section Client instance', () => {
    expect(client).toBeInstanceOf(GridSectionClient);
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
  it('should call /grid-section when run is called', async () => {
    const boundingBox = {
      southwest: generateCoordinate(),
      northeast: generateCoordinate(),
    };
    const transportArguments = {
      method: 'get',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/grid-section',
      query: {
        key: apiKey,
        'bounding-box': `${boundingBox.southwest.lat},${boundingBox.southwest.lng},${boundingBox.northeast.lat},${boundingBox.northeast.lng}`,
        format: 'json',
      },
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };
    await client.run({ boundingBox });

    expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
  });
  it('should throw error if no bounding box is specified', async () => {
    try {
      await client.run(undefined as never);
    } catch (err) {
      expect(err.message).toEqual('No bounding box specified');
    } finally {
      expect(transportSpy).not.toHaveBeenCalled();
    }
  });
  it('should throw error if bounding box latitudes are invalid', async () => {
    const boundingBox = {
      northeast: { lat: 95, lng: -2 },
      southwest: generateCoordinate(),
    };
    try {
      await client.run({ boundingBox });
    } catch (err) {
      expect(err.message).toEqual(
        'Invalid latitude provided. Latitude must be >= -90 and <= 90'
      );
    } finally {
      expect(transportSpy).not.toHaveBeenCalledWith();
    }
  });
});
