import { Mock } from 'vitest';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  GridSectionClient,
  HEADERS,
  Transport,
} from '@/.';
import { generateCoordinate } from '@utils/fixtures';

const CHANCE = new Chance();

describe('Grid Section Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let utilisation: string;
  let sessionId: string;
  let config: ApiClientConfiguration;
  let transportSpy: Mock;
  let transport: Transport;
  let client: GridSectionClient;

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
    client = GridSectionClient.init(apiKey, config, transport);
  });

  it('should return instantiate an Grid Section Client instance', () => {
    expect(client).toBeInstanceOf(GridSectionClient);
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
      headers: {
        'X-Api-Key': apiKey,
        'X-Correlation-ID': sessionId,
        ...HEADERS,
      },
      body: null,
    };
    await client.run({ boundingBox });
    expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
  });
  it('should throw error if no bounding box is specified', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.run(undefined as any);
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
      expect(transportSpy).not.toHaveBeenCalled();
    }
  });
});
