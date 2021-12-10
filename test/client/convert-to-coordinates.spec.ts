import 'should';
import { spy, SinonSpy } from 'sinon';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  ConvertToCoordinatesClient,
  HEADERS,
  Transport,
} from '../../src';

const CHANCE = new Chance();

describe('Convert to Coordinates Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: SinonSpy;
  let transport: Transport;
  let client: ConvertToCoordinatesClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    config = { host, apiVersion };
    transportSpy = spy();
    transport = async (...args) => {
      transportSpy(...args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200, body: {} as any };
    };
    client = ConvertToCoordinatesClient.init(apiKey, config, transport);
  });

  it('should return instantiate an Convert to Coordinates Client instance', () => {
    client.should.be.instanceOf(ConvertToCoordinatesClient);
    client.should.have.properties([
      '_apiKey',
      'apiKey',
      '_config',
      'config',
      'run',
      'transport',
    ]);
    client['_apiKey'].should.be
      .String()
      .and.equal(apiKey, 'api key does not match');
    client['_config'].should.be
      .Object()
      .and.eql(config, 'config does not match');
    client.apiKey.should.be.Function();
    client.config.should.be.Function();
  });
  it('should return the api key when apiKey function is called with no parameter', () => {
    client.apiKey().should.be.equal(apiKey, 'api key does not match');
  });
  it('should set the api key when apiKey function is called with value', () => {
    const _apiKey = CHANCE.string({ length: 8 });
    client
      .apiKey()
      .should.be.equal(apiKey, 'initial api key should match new value');
    client.apiKey(_apiKey).should.be.equal(client, 'api key does not match');
    client.apiKey().should.be.equal(_apiKey, 'api key should match new value');
  });
  it('should return the config when config function is called with no parameter', () => {
    client.config().should.be.eql(config, 'config does not match');
  });
  it('should set the config when config function is called with value', () => {
    const defaultConfig = { host, apiVersion };
    const config = {
      host: CHANCE.url(),
      apiVersion: CHANCE.pickone([ApiVersion.Version2, ApiVersion.Version3]),
      headers: {},
    };
    client
      .config()
      .should.be.eql(defaultConfig, 'default config does not match');
    client.config(config).should.be.eql(client, 'client instance not returned');
    client.config().should.be.eql(config, 'config should match new value');
  });
  it('should call /convert-to-coordinates when run is called', async () => {
    const words = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`;
    const transportArguments = {
      method: 'get',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/convert-to-coordinates',
      query: {
        key: apiKey,
        words,
        format: 'json',
      },
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };
    await client.run({ words });
    transportSpy
      .calledOnceWith(transportArguments)
      .should.be.equal(true, 'transport arguments do not match');
  });
  it('should throw error if no words provided', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.run(undefined as any);
    } catch (err) {
      err.message.should.be.equal(
        'You must specify the words to convert to coordinates'
      );
    } finally {
      transportSpy.notCalled.should.be.eql(
        true,
        'transport should not been called'
      );
    }
  });
});
