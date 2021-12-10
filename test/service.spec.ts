import 'should';
import nock from 'nock';
import { Chance } from 'chance';
import what3words, {
  ApiClientConfiguration,
  ApiVersion,
  searchParams,
} from '../src';
import { What3wordsService } from '../src/service';

const CHANCE = new Chance();
const MOCK_AUTOSUGGEST_RESPONSE = { suggestions: [] };
const MOCK_AVAILABLE_LANGUAGES_RESPONSE = { languages: [] };
const MOCK_C23WA_RESPONSE = {};
const MOCK_C2C_RESPONSE = {};
const MOCK_GRID_SECTION_RESPONSE = {};

describe('what3words', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: What3wordsService;
  let apiVersion: ApiVersion;
  let apiKey: string;
  let config: ApiClientConfiguration;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = CHANCE.pickone([
      ApiVersion.Version1,
      ApiVersion.Version2,
      ApiVersion.Version3,
    ]);
    config = {
      host: CHANCE.url(),
      apiVersion,
      headers: {},
    };
  });

  describe('Service', () => {
    beforeEach(() => {
      service = what3words(apiKey, config);
    });

    it('should instantiate the what3words service instance', () => {
      service.should.have.properties([
        'clients',
        'setApiKey',
        'setConfig',
        'autosuggest',
        'autosuggestSelection',
        'availableLanguages',
        'convertTo3wa',
        'convertToCoordinates',
        'gridSection',
      ]);
      service.clients.should.be
        .Object()
        .and.have.properties([
          'autosuggest',
          'availableLanguages',
          'convertTo3wa',
          'convertToCoordinates',
          'gridSection',
        ]);
      service.setApiKey.should.be.Function();
      service.setConfig.should.be.Function();
      service.autosuggest.should.be.Function();
      service.autosuggestSelection.should.be.Function();
      service.availableLanguages.should.be.Function();
      service.convertTo3wa.should.be.Function();
      service.convertToCoordinates.should.be.Function();
      service.gridSection.should.be.Function();
    });
    it('should set the api key for all clients', () => {
      const newApiKey = CHANCE.string({ length: 8 });

      service.clients.autosuggest.apiKey().should.be.equal(apiKey);
      service.clients.availableLanguages.apiKey().should.be.equal(apiKey);
      service.clients.convertTo3wa.apiKey().should.be.equal(apiKey);
      service.clients.convertToCoordinates.apiKey().should.be.equal(apiKey);
      service.clients.gridSection.apiKey().should.be.equal(apiKey);

      service.setApiKey(newApiKey);

      service.clients.autosuggest.apiKey().should.be.equal(newApiKey);
      service.clients.availableLanguages.apiKey().should.be.equal(newApiKey);
      service.clients.convertTo3wa.apiKey().should.be.equal(newApiKey);
      service.clients.convertToCoordinates.apiKey().should.be.equal(newApiKey);
      service.clients.gridSection.apiKey().should.be.equal(newApiKey);
    });
    it('should set the config for all clients', () => {
      const newConfig = {
        host: CHANCE.url(),
        apiVersion: CHANCE.pickone(
          [
            ApiVersion.Version1,
            ApiVersion.Version2,
            ApiVersion.Version3,
          ].filter(v => v !== apiVersion)
        ),
        headers: {},
      };

      service.clients.autosuggest.config().should.be.eql(config);
      service.clients.availableLanguages.config().should.be.eql(config);
      service.clients.convertTo3wa.config().should.be.eql(config);
      service.clients.convertToCoordinates.config().should.be.eql(config);
      service.clients.gridSection.config().should.be.eql(config);

      service.setConfig(newConfig);

      service.clients.autosuggest.config().should.be.eql(newConfig);
      service.clients.availableLanguages.config().should.be.eql(newConfig);
      service.clients.convertTo3wa.config().should.be.eql(newConfig);
      service.clients.convertToCoordinates.config().should.be.eql(newConfig);
      service.clients.gridSection.config().should.be.eql(newConfig);
    });
  });

  describe('Axios Transport', () => {
    let input: string;
    beforeEach(() => {
      service = what3words(apiKey, config, { transport: 'axios' });
      input = CHANCE.string();
      nock(`${config.host!}/${config.apiVersion}`)
        .get(`/autosuggest?${searchParams({ input, key: apiKey })}`)
        .reply(200, MOCK_AUTOSUGGEST_RESPONSE)
        .get('/available-languages')
        .reply(200, MOCK_AVAILABLE_LANGUAGES_RESPONSE)
        .get('/convert-to-3wa')
        .reply(200, MOCK_C2C_RESPONSE)
        .get('/convert-to-coordinates')
        .reply(200, MOCK_C23WA_RESPONSE)
        .get('/grid-section')
        .reply(200, MOCK_GRID_SECTION_RESPONSE);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should use the axios transport', () => {
      service.clients.autosuggest['transport'].name.should.be.eql(
        'axiosTransport'
      );
      service.clients.availableLanguages['transport'].name.should.be.eql(
        'axiosTransport'
      );
      service.clients.convertTo3wa['transport'].name.should.be.eql(
        'axiosTransport'
      );
      service.clients.convertToCoordinates['transport'].name.should.be.eql(
        'axiosTransport'
      );
      service.clients.gridSection['transport'].name.should.be.eql(
        'axiosTransport'
      );
    });
    it('should use the axios transport to make autosuggest requests', async () => {
      const response = await service.autosuggest({ input });
      response.should.be.eql(MOCK_AUTOSUGGEST_RESPONSE);
    });
  });
});
