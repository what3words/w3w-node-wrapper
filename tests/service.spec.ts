import nock from 'nock';
import { Chance } from 'chance';
import what3words, {
  ApiClientConfiguration,
  ApiVersion,
  searchParams,
  axiosTransport,
} from '@/.';
import { What3wordsService } from '@/service';

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
      expect(service).toHaveProperty('clients');
      expect(service).toHaveProperty('setApiKey');
      expect(service).toHaveProperty('setConfig');
      expect(service).toHaveProperty('autosuggest');
      expect(service).toHaveProperty('autosuggestSelection');
      expect(service).toHaveProperty('availableLanguages');
      expect(service).toHaveProperty('convertTo3wa');
      expect(service).toHaveProperty('convertToCoordinates');
      expect(service).toHaveProperty('gridSection');
      expectTypeOf(service.clients).toBeObject();
      expect(service.clients).toHaveProperty('autosuggest');
      expect(service.clients).toHaveProperty('availableLanguages');
      expect(service.clients).toHaveProperty('convertTo3wa');
      expect(service.clients).toHaveProperty('convertToCoordinates');
      expect(service.clients).toHaveProperty('gridSection');
      expectTypeOf(service.setApiKey).toBeFunction();
      expectTypeOf(service.setConfig).toBeFunction();
      expectTypeOf(service.autosuggest).toBeFunction();
      expectTypeOf(service.autosuggestSelection).toBeFunction();
      expectTypeOf(service.availableLanguages).toBeFunction();
      expectTypeOf(service.convertTo3wa).toBeFunction();
      expectTypeOf(service.convertToCoordinates).toBeFunction();
      expectTypeOf(service.gridSection).toBeFunction();
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
        'axiosTransport2'
      );
      expect(service.clients.availableLanguages['transport'].name).toEqual(
        'axiosTransport2'
      );
      expect(service.clients.convertTo3wa['transport'].name).toEqual(
        'axiosTransport2'
      );
      expect(service.clients.convertToCoordinates['transport'].name).toEqual(
        'axiosTransport2'
      );
      expect(service.clients.gridSection['transport'].name).toEqual(
        'axiosTransport2'
      );
    });
    it('should use the axios transport to make autosuggest requests', async () => {
      const response = await service.autosuggest({ input });
      expect(response).toEqual(MOCK_AUTOSUGGEST_RESPONSE);
    });
  });
});
