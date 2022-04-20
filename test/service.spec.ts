import nock from 'nock';
import { Chance } from 'chance';
import what3words, {
  ApiClientConfiguration,
  ApiVersion,
  searchParams,
  axiosTransport,
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
      const properties = [
        'clients',
        'setApiKey',
        'setConfig',
        'autosuggest',
        'autosuggestSelection',
        'availableLanguages',
        'convertTo3wa',
        'convertToCoordinates',
        'gridSection',
      ];
      properties.forEach(property => expect(service).toHaveProperty(property));
      expect(typeof service.clients).toBe('object');
      const clientProperties = [
        'autosuggest',
        'availableLanguages',
        'convertTo3wa',
        'convertToCoordinates',
        'gridSection',
      ];
      clientProperties.forEach(property =>
        expect(service.clients).toHaveProperty(property)
      );
      expect(typeof service.setApiKey).toBe('function');
      expect(typeof service.setConfig).toBe('function');
      expect(typeof service.autosuggest).toBe('function');
      expect(typeof service.autosuggestSelection).toBe('function');
      expect(typeof service.availableLanguages).toBe('function');
      expect(typeof service.convertTo3wa).toBe('function');
      expect(typeof service.convertToCoordinates).toBe('function');
      expect(typeof service.gridSection).toBe('function');
    });
    it('should set the api key for all clients', () => {
      const newApiKey = CHANCE.string({ length: 8 });

      expect(service.clients.autosuggest.apiKey()).toEqual(apiKey);
      expect(service.clients.availableLanguages.apiKey()).toEqual(apiKey);
      expect(service.clients.convertTo3wa.apiKey()).toEqual(apiKey);
      expect(service.clients.convertToCoordinates.apiKey()).toEqual(apiKey);
      expect(service.clients.gridSection.apiKey()).toEqual(apiKey);

      service.setApiKey(newApiKey);

      expect(service.clients.autosuggest.apiKey()).toEqual(newApiKey);
      expect(service.clients.availableLanguages.apiKey()).toEqual(newApiKey);
      expect(service.clients.convertTo3wa.apiKey()).toEqual(newApiKey);
      expect(service.clients.convertToCoordinates.apiKey()).toEqual(newApiKey);
      expect(service.clients.gridSection.apiKey()).toEqual(newApiKey);
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

      expect(service.clients.autosuggest.config()).toEqual(config);
      expect(service.clients.availableLanguages.config()).toEqual(config);
      expect(service.clients.convertTo3wa.config()).toEqual(config);
      expect(service.clients.convertToCoordinates.config()).toEqual(config);
      expect(service.clients.gridSection.config()).toEqual(config);

      service.setConfig(newConfig);

      expect(service.clients.autosuggest.config()).toEqual(newConfig);
      expect(service.clients.availableLanguages.config()).toEqual(newConfig);
      expect(service.clients.convertTo3wa.config()).toEqual(newConfig);
      expect(service.clients.convertToCoordinates.config()).toEqual(newConfig);
      expect(service.clients.gridSection.config()).toEqual(newConfig);
    });
  });

  describe('Axios Transport', () => {
    let input: string;
    beforeEach(() => {
      service = what3words(apiKey, config, { transport: axiosTransport() });
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
      expect(service.clients.autosuggest['transport'].name).toEqual(
        'axiosTransport'
      );
      expect(service.clients.availableLanguages['transport'].name).toEqual(
        'axiosTransport'
      );
      expect(service.clients.convertTo3wa['transport'].name).toEqual(
        'axiosTransport'
      );
      expect(service.clients.convertToCoordinates['transport'].name).toEqual(
        'axiosTransport'
      );
      expect(service.clients.gridSection['transport'].name).toEqual(
        'axiosTransport'
      );
    });
    it('should use the axios transport to make autosuggest requests', async () => {
      const response = await service.autosuggest({ input });
      expect(response).toEqual(MOCK_AUTOSUGGEST_RESPONSE);
    });
  });
});
