import { Mock } from 'vitest';
import nock from 'nock';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  AutosuggestClient,
  AutosuggestInputType,
  HEADERS,
  RequestParams,
  Transport,
} from '@/.';
import { UtilisationFn } from '@/lib/utilisation';
import {
  generateAutosuggestSuggestion,
  generateCoordinate,
} from '@utils/fixtures';
import { languages } from '@/lib/languages/language-codes';

const CHANCE = new Chance();

describe('Autosuggest Client', () => {
  describe('init()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let utilisation: string;
    let sessionId: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      utilisation = CHANCE.url({ path: '' });
      sessionId = CHANCE.guid();
      config = {
        host,
        apiVersion,
        headers: {},
        sessionId,
        utilisation,
      };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should instantiate an Autosuggest Client instance', () => {
      expect(client).toBeInstanceOf(AutosuggestClient);
      expect(client).toHaveProperty('_apiKey');
      expect(client).toHaveProperty('apiKey');
      expect(client).toHaveProperty('_config');
      expect(client).toHaveProperty('config');
      expect(client).toHaveProperty('lastReqOpts');
      expect(client).toHaveProperty('onSelected');
      expect(client).toHaveProperty('run');
      expect(client).toHaveProperty('transport');
      expectTypeOf(client['_apiKey']).toBeString();
      expect(client['_apiKey']).toEqual(apiKey);
      expectTypeOf(client['_config']).toBeObject();
      expect(client['_config']).toEqual(config);
      expectTypeOf(client['lastReqOpts']).toBeObject();
      expect(client['lastReqOpts']).toEqual({ input: '' });
      expectTypeOf(client.apiKey).toBeFunction();
      expectTypeOf(client.config).toBeFunction();
      expectTypeOf(client.onSelected).toBeFunction();
    });
  });

  describe('apiKey()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let sessionId: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      sessionId = CHANCE.guid();
      config = {
        host,
        apiVersion,
        headers: {},
        sessionId,
      };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should return the api key when called with no parameter', () => {
      expect(client.apiKey()).toEqual(apiKey);
    });

    it('should set the api key when called with value', () => {
      const _apiKey = CHANCE.string({ length: 8 });
      expect(client.apiKey()).toEqual(apiKey);
      expect(client.apiKey(_apiKey)).toEqual(client);
      expect(client.apiKey()).toEqual(_apiKey);
    });
  });

  describe('config()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let utilisation: string;
    let sessionId: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      utilisation = CHANCE.url({ path: '' });
      sessionId = CHANCE.guid();
      config = {
        host,
        apiVersion,
        headers: {},
        sessionId,
        utilisation,
      };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should return the config when called with no parameter', () => {
      expect(client.config()).toEqual(config);
    });

    it('should set the config when called with value', () => {
      const defaultConfig = {
        host,
        apiVersion,
        headers: {},
        sessionId,
        utilisation,
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
  });

  describe('onSelected()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let utilisation: string;
    let sessionId: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      utilisation = CHANCE.url({ path: CHANCE.word() });
      sessionId = CHANCE.guid();
      config = {
        host,
        utilisation,
        apiVersion,
        headers: {},
        sessionId,
      };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      client = AutosuggestClient.init(apiKey, config, transport);
    });

    it('should call /autosuggest-selection with selected suggestion', () => {
      const selected = generateAutosuggestSuggestion();
      const transportArguments = {
        method: 'get',
        host: `${host.replace(/\/$/, '')}/${apiVersion}`,
        url: '/autosuggest-selection',
        query: {
          'raw-input': '',
          selection: selected.words,
          rank: `${selected.rank}`,
          'source-api': 'text',
          key: apiKey,
        },
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-ID': sessionId,
          ...HEADERS,
        },
        body: null,
      };

      expect(client.onSelected(selected)).resolves.toBeUndefined();
      expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
    });

    describe('should call /autosuggest-selection with initial request options override', () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const nResults = CHANCE.natural();
      const nFocusResults = CHANCE.natural();
      const focus = generateCoordinate();
      const clipToBoundingBox = {
        southwest: { lat: 71.2, lng: -0.123 },
        northeast: { lat: 91, lng: -0.12 },
      };
      const clipToCircle = {
        center: generateCoordinate(),
        radius: CHANCE.natural(),
      };
      const clipToCountry = [CHANCE.locale()];
      const startEndCoordinate = generateCoordinate();
      const clipToPolygon = [
        startEndCoordinate,
        generateCoordinate(),
        generateCoordinate(),
        generateCoordinate(),
        startEndCoordinate,
      ];
      const language = CHANCE.locale();
      const preferLand = CHANCE.bool();
      const selected = generateAutosuggestSuggestion();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let transportArguments: { [key: string]: any };

      beforeEach(() => {
        transportArguments = {
          method: 'get',
          host: `${host.replace(/\/$/, '')}/${apiVersion}`,
          url: '/autosuggest-selection',
          query: {
            key: apiKey,
            'raw-input': input,
            selection: selected.words,
            rank: `${selected.rank}`,
            'n-results': `${nResults}`,
            focus: `${focus.lat},${focus.lng}`,
            'n-focus-results': `${nFocusResults}`,
            'clip-to-bounding-box': `${clipToBoundingBox.southwest.lat},${clipToBoundingBox.southwest.lng},${clipToBoundingBox.northeast.lat},${clipToBoundingBox.northeast.lng}`,
            'clip-to-circle': `${clipToCircle.center.lat},${clipToCircle.center.lng},${clipToCircle.radius}`,
            'clip-to-country': clipToCountry.join(','),
            'clip-to-polygon': clipToPolygon
              .map(coord => `${coord.lat},${coord.lng}`)
              .join(','),
            language,
            'prefer-land': `${preferLand}`,
          },
          headers: {
            'X-Api-Key': apiKey,
            'X-Correlation-ID': sessionId,
            ...HEADERS,
          },
          body: null,
        };
      });

      it('text input type', async () => {
        const inputType = AutosuggestInputType.Text;
        transportArguments.query['input-type'] = inputType;
        transportArguments.query['source-api'] = 'text';

        expect(
          client.onSelected(selected, {
            input,
            inputType,
            nResults,
            nFocusResults,
            focus,
            clipToBoundingBox,
            clipToCircle,
            clipToCountry,
            clipToPolygon,
            language,
            preferLand,
          })
        ).resolves.toBeUndefined();
        expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
      });
      it('voice input type', async () => {
        const inputType = AutosuggestInputType.GenericVoice;
        transportArguments.query['input-type'] = inputType;
        transportArguments.query['source-api'] = 'voice';

        expect(
          client.onSelected(selected, {
            input,
            inputType,
            nResults,
            nFocusResults,
            focus,
            clipToBoundingBox,
            clipToCircle,
            clipToCountry,
            clipToPolygon,
            language,
            preferLand,
          })
        ).resolves.toBeUndefined();
        expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
      });
    });
  });

  describe('run()', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let utilisation: string;
    let sessionId: string;
    let config: ApiClientConfiguration;
    let transportSpy: Mock;
    let transport: Transport;
    let utilisationFnSpy: Mock;
    let utilisationFn: UtilisationFn;
    let client: AutosuggestClient;

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = CHANCE.url({ path: '' });
      utilisation = CHANCE.url({ path: CHANCE.word() });
      sessionId = CHANCE.guid();
      config = {
        host,
        utilisation,
        apiVersion,
        headers: {},
        sessionId,
      };
      transportSpy = vi.fn();
      transport = async (...args) => {
        transportSpy(...args);
        return {
          status: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: {} as any,
        };
      };
      utilisationFnSpy = vi.fn();
      utilisationFn = (path: string, data?: RequestParams) => {
        utilisationFnSpy([path, data]);
        switch (path) {
          case '/autosuggest':
            return {
              headers: data?.headers,
              body: null,
            };
          case '/autosuggest-selection':
          default:
            return null;
        }
      };
      client = AutosuggestClient.init(apiKey, config, transport, utilisationFn);
    });

    it('should call /autosuggest', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const inputType = AutosuggestInputType.Text;
      const nResults = CHANCE.natural();
      const nFocusResults = CHANCE.natural();
      const focus = generateCoordinate();
      const clipToBoundingBox = {
        southwest: { lat: 71.2, lng: -0.123 },
        northeast: { lat: 91, lng: -0.12 },
      };
      const clipToCircle = {
        center: generateCoordinate(),
        radius: CHANCE.natural(),
      };
      const clipToCountry = [CHANCE.locale()];
      const startEndCoordinate = generateCoordinate();
      const clipToPolygon = [
        startEndCoordinate,
        generateCoordinate(),
        generateCoordinate(),
        generateCoordinate(),
        startEndCoordinate,
      ];
      const language = CHANCE.pickone(languages);
      const preferLand = CHANCE.bool();
      const transportArguments = {
        method: 'get',
        host: `${host.replace(/\/$/, '')}/${apiVersion}`,
        url: '/autosuggest',
        query: {
          key: apiKey,
          input,
          'n-results': `${nResults}`,
          focus: `${focus.lat},${focus.lng}`,
          'n-focus-results': `${nFocusResults}`,
          'clip-to-bounding-box': `${clipToBoundingBox.southwest.lat},${clipToBoundingBox.southwest.lng},${clipToBoundingBox.northeast.lat},${clipToBoundingBox.northeast.lng}`,
          'clip-to-circle': `${clipToCircle.center.lat},${clipToCircle.center.lng},${clipToCircle.radius}`,
          'clip-to-country': clipToCountry.join(','),
          'clip-to-polygon': clipToPolygon
            .map(coord => `${coord.lat},${coord.lng}`)
            .join(','),
          language,
          'prefer-land': `${preferLand}`,
          'input-type': inputType,
        },
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-ID': sessionId,
          ...HEADERS,
        },
        body: null,
      };

      await client.run({
        input,
        inputType,
        nResults,
        nFocusResults,
        focus,
        clipToBoundingBox,
        clipToCircle,
        clipToCountry,
        clipToPolygon,
        language,
        preferLand,
      });
      expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
    });

    it('should send metrics to utilisation-api when /autosuggest is called', async () => {
      client = AutosuggestClient.init(
        apiKey,
        { ...config, host: 'http://api.what3words.com' },
        transport,
        utilisationFn
      );
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const inputType = AutosuggestInputType.Text;
      const nResults = CHANCE.natural();
      const nFocusResults = CHANCE.natural();
      const focus = generateCoordinate();
      const clipToBoundingBox = {
        southwest: { lat: 71.2, lng: -0.123 },
        northeast: { lat: 91, lng: -0.12 },
      };
      const clipToCircle = {
        center: generateCoordinate(),
        radius: CHANCE.natural(),
      };
      const clipToCountry = [CHANCE.locale()];
      const startEndCoordinate = generateCoordinate();
      const clipToPolygon = [
        startEndCoordinate,
        generateCoordinate(),
        generateCoordinate(),
        generateCoordinate(),
        startEndCoordinate,
      ];
      const language = CHANCE.pickone(languages);
      const preferLand = CHANCE.bool();
      const transportArguments = {
        method: 'get',
        host: `http://api.what3words.com/${apiVersion}`,
        url: '/autosuggest',
        query: {
          key: apiKey,
          input,
          'n-results': `${nResults}`,
          focus: `${focus.lat},${focus.lng}`,
          'n-focus-results': `${nFocusResults}`,
          'clip-to-bounding-box': `${clipToBoundingBox.southwest.lat},${clipToBoundingBox.southwest.lng},${clipToBoundingBox.northeast.lat},${clipToBoundingBox.northeast.lng}`,
          'clip-to-circle': `${clipToCircle.center.lat},${clipToCircle.center.lng},${clipToCircle.radius}`,
          'clip-to-country': clipToCountry.join(','),
          'clip-to-polygon': clipToPolygon
            .map(coord => `${coord.lat},${coord.lng}`)
            .join(','),
          language,
          'prefer-land': `${preferLand}`,
          'input-type': inputType,
        },
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-ID': sessionId,
          ...HEADERS,
        },
        body: null,
      };

      await client.run({
        input,
        inputType,
        nResults,
        nFocusResults,
        focus,
        clipToBoundingBox,
        clipToCircle,
        clipToCountry,
        clipToPolygon,
        language,
        preferLand,
      });
      // Additional assertion to ensure that transport is called twice.
      // This will prove that `sendUtilisation` was invoked which also uses the transport instance.
      expect(transportSpy).toHaveBeenCalledTimes(2);
      expect(transportSpy).toHaveBeenNthCalledWith(1, {
        method: 'post',
        host: utilisation,
        url: '/autosuggest-session',
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-ID': sessionId,
          ...HEADERS,
        },
        body: null,
      });
      expect(transportSpy).toHaveBeenNthCalledWith(2, transportArguments);
    });

    it('should call /autosuggest with voice input type', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const inputType = CHANCE.pickone([
        AutosuggestInputType.VoconHybrid,
        AutosuggestInputType.NMDP_ASR,
        AutosuggestInputType.GenericVoice,
      ]);
      const language = CHANCE.pickone(languages);
      const transportArguments = {
        method: 'get',
        host: `${host.replace(/\/$/, '')}/${apiVersion}`,
        url: '/autosuggest',
        query: {
          key: apiKey,
          input,
          'input-type': inputType,
          language,
        },
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-ID': sessionId,
          ...HEADERS,
        },
        body: null,
      };

      await client.run({
        input,
        inputType,
        language,
      });
      expect(transportSpy).toHaveBeenNthCalledWith(1, transportArguments);
    });

    it('should throw error when no language provided with voice input type', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const inputType = CHANCE.pickone([
        AutosuggestInputType.VoconHybrid,
        AutosuggestInputType.NMDP_ASR,
        AutosuggestInputType.GenericVoice,
      ]);

      try {
        await client.run({
          input,
          inputType,
        });
      } catch (err) {
        expect(err.message).toEqual(
          'You must provide language when using a speech input type'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if no options provided', async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.run(undefined as any);
      } catch (err) {
        expect(err.message).toEqual('You must provide at least options.input');
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if input is empty', async () => {
      const input = '';

      try {
        await client.run({ input });
      } catch (err) {
        expect(err.message).toEqual('You must specify an input value');
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if clipToBoundingBox has southwest lat > northeast lat', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const clipToBoundingBox = {
        southwest: { lat: 2, lng: 3 },
        northeast: { lat: 1, lng: 5 },
      };

      try {
        await client.run({ input, clipToBoundingBox });
      } catch (err) {
        expect(err.message).toEqual(
          'Southwest lat must be less than or equal to northeast lat and southwest lng must be less than or equal to northeast lng'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if clipToBoundingBox has southwest lng > northeast lng', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const clipToBoundingBox = {
        southwest: { lat: 1, lng: 9 },
        northeast: { lat: 1, lng: 5 },
      };

      try {
        await client.run({ input, clipToBoundingBox });
      } catch (err) {
        expect(err.message).toEqual(
          'Southwest lat must be less than or equal to northeast lat and southwest lng must be less than or equal to northeast lng'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if clipToCountry has incorrect value', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const clipToCountry = [
        CHANCE.locale(),
        CHANCE.string({ length: 3 }),
        CHANCE.locale(),
      ];

      try {
        await client.run({ input, clipToCountry });
      } catch (err) {
        expect(err.message).toEqual(
          'Invalid clip to country. All values must be an ISO 3166-1 alpha-2 country code'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if clipToPolygon has less than 4 entries', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const firstLastCoord = generateCoordinate();
      const clipToPolygon = [
        firstLastCoord,
        generateCoordinate(),
        firstLastCoord,
      ];

      try {
        await client.run({ input, clipToPolygon });
      } catch (err) {
        expect(err.message).toEqual(
          'Invalid clip to polygon value. Array must contain at least 4 coordinates and no more than 25'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if clipToPolygon is not closed', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const clipToPolygon = [
        generateCoordinate(),
        generateCoordinate(),
        generateCoordinate(),
        generateCoordinate(),
      ];

      try {
        await client.run({ input, clipToPolygon });
      } catch (err) {
        expect(err.message).toEqual(
          'Invalid clip to polygon value. The polygon bounds must be closed.'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if inputType is not valid', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const inputType = 'abc' as AutosuggestInputType;

      try {
        await client.run({ input, inputType });
      } catch (err) {
        expect(err.message).toEqual(
          'Invalid input type provided. Must provide a valid input type.'
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    it('should throw error if language is not valid', async () => {
      const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
      const language = 'abc';

      try {
        await client.run({ input, language });
      } catch (err) {
        expect(err.message).toEqual(
          `The language ${language} is not supported. Refer to our API for supported languages.`
        );
      } finally {
        expect(transportSpy).not.toHaveBeenCalled();
      }
    });

    const voiceInputTypes = [
      AutosuggestInputType.GenericVoice,
      AutosuggestInputType.NMDP_ASR,
      AutosuggestInputType.VoconHybrid,
    ];

    voiceInputTypes.forEach(inputType => {
      it(`should throw error if voice inputType ${inputType} is specified but no language provided`, async () => {
        const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;

        try {
          await client.run({ input, inputType });
        } catch (err) {
          expect(err.message).toEqual(
            'You must provide language when using a speech input type'
          );
        } finally {
          expect(transportSpy).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('regex validation', () => {
    let apiKey: string;
    let apiVersion: ApiVersion;
    let host: string;
    let config: ApiClientConfiguration;
    let client: AutosuggestClient;
    const invalidStrings = [
      // a
      CHANCE.letter(),
      // word
      CHANCE.word(),
      // 1
      `${CHANCE.natural()}`,
      // 1.2.3
      `${CHANCE.natural()}.${CHANCE.natural()}.${CHANCE.natural()}`,
      // word.a
      `${CHANCE.word()}.${CHANCE.letter()}`,
      // word.1
      `${CHANCE.word()}.${CHANCE.natural()}`,
      // word.word2.1
      `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.natural()}`,
      // word;a
      `${CHANCE.word()}${CHANCE.character({
        symbols: true,
      })}${CHANCE.letter()}`,
      // word;1
      `${CHANCE.word()}${CHANCE.character({
        symbols: true,
      })}${CHANCE.natural()}`,
      // word?word2;1
      `${CHANCE.word()}${CHANCE.character({
        symbols: true,
      })}${CHANCE.word()}${CHANCE.character({
        symbols: true,
      })}${CHANCE.natural()}`,
    ];
    const validStrings = [
      // a.b.c
      `${CHANCE.letter()}.${CHANCE.letter()}.${CHANCE.letter()}`,
      // word.word2.word3
      `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`,
    ];

    beforeEach(() => {
      apiKey = CHANCE.string({ length: 8 });
      apiVersion = ApiVersion.Version1;
      host = 'https://api.dev.non-production.w3w.io';
      config = {
        host,
        apiVersion,
        headers: {},
      };
      client = AutosuggestClient.init(apiKey, config);
    });

    describe('findPossible3wa()', () => {
      it('should return an empty array if empty string is provided', async () => {
        expect(client.findPossible3wa('')).toHaveLength(0);
      });

      describe('invalid value', () => {
        const invalidSubstrings = invalidStrings.map(
          v => `text with invalid three word address: ${v}`
        );

        invalidStrings.forEach(invalidString => {
          it(`should return an empty array if "${invalidString}" is provided`, async () => {
            expect(client.findPossible3wa(invalidString)).toHaveLength(0);
          });
        });

        invalidSubstrings.forEach(invalidSubstring => {
          it(`should return an empty array if "${invalidSubstring}" is provided`, async () => {
            expect(client.findPossible3wa(invalidSubstring)).toHaveLength(0);
          });
        });
      });

      describe('valid value', () => {
        const validSubstrings = validStrings.map(
          v => `text with valid three word address: ${v}`
        );

        validStrings.forEach(validString => {
          it(`should return a match if "${validString}" is provided`, async () => {
            expect(client.findPossible3wa(validString)).toContainEqual(
              validString
            );
          });
        });

        validSubstrings.forEach(substring => {
          it(`should return a match if "${substring}" is provided`, async () => {
            expect(
              client
                .findPossible3wa(substring)
                .every(res => validStrings.includes(res))
            ).toBeTruthy();
          });
        });
      });
    });

    describe('isPossible3wa()', () => {
      it('should return false if empty string is provided', async () => {
        expect(client.isPossible3wa('')).toBeFalsy();
      });
      invalidStrings.forEach(invalidString => {
        it(`should return false if "${invalidString}" is provided`, async () => {
          expect(client.isPossible3wa(invalidString)).toBeFalsy();
        });
      });
      validStrings.forEach(validString => {
        it(`should return true if "${validString}" is provided`, async () => {
          expect(client.isPossible3wa(validString)).toBeTruthy();
        });
      });
    });

    describe('isValid3wa()', () => {
      it('should return false if empty string is provided', async () => {
        const input = '';
        const isValid = client.isValid3wa(input);
        expect(isValid).toBeInstanceOf(Promise);
        expect(isValid).resolves.toBeFalsy();
      });
      it('should return false if invalid value is provided', async () => {
        const input = invalidStrings[0];
        const isValid = client.isValid3wa(input);
        expect(isValid).toBeInstanceOf(Promise);
        expect(isValid).resolves.toBeFalsy();
      });
      describe('valid values', () => {
        validStrings.forEach(input => {
          it(`should return true if valid value "${input}" is provided`, async () => {
            nock(host, {
              allowUnmocked: false,
            })
              .get('/v1/autosuggest')
              .query(true) // exclude queries from url matching
              .reply(200, { suggestions: [{ words: input }] });

            const isValid = await client.isValid3wa(input);
            expect(isValid).toBeTruthy();
            nock.cleanAll();
          });
        });
      });
    });
  });
});
