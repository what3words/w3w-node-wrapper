import { spy, SinonSpy } from 'sinon';
import { Chance } from 'chance';
import {
  ApiClientConfiguration,
  ApiVersion,
  AutosuggestClient,
  AutosuggestInputType,
  HEADERS,
  Transport,
} from '../../src';
import { generateAutosuggestSuggestion, generateCoordinate } from '../fixtures';

const CHANCE = new Chance();

describe('Autosuggest Client', () => {
  let apiKey: string;
  let apiVersion: ApiVersion;
  let host: string;
  let config: ApiClientConfiguration;
  let transportSpy: SinonSpy;
  let transport: Transport;
  let client: AutosuggestClient;

  beforeEach(() => {
    apiKey = CHANCE.string({ length: 8 });
    apiVersion = ApiVersion.Version1;
    host = CHANCE.url({ path: '' });
    config = { host, apiVersion, headers: {} };
    transportSpy = spy();
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
    const properties = [
      '_apiKey',
      'apiKey',
      '_config',
      'config',
      'lastReqOpts',
      'onSelected',
      'run',
      'transport',
    ];
    properties.forEach(property => expect(client).toHaveProperty(property));
    expect(typeof client['_apiKey']).toBe('string');
    expect(client['_apiKey']).toEqual(apiKey);
    expect(typeof client['_config']).toBe('object');
    expect(client['_config']).toEqual(config);
    expect(typeof client['lastReqOpts']).toBe('object');
    expect(client['lastReqOpts']).toEqual({ input: '' });
    expect(typeof client.apiKey).toBe('function');
    expect(typeof client.config).toBe('function');
    expect(typeof client.onSelected).toBe('function');
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
    const defaultConfig = { host, apiVersion, headers: {} };
    const config = {
      host: CHANCE.url(),
      apiVersion: CHANCE.pickone([ApiVersion.Version2, ApiVersion.Version3]),
      headers: {},
    };
    expect(client.config()).toEqual(defaultConfig);
    expect(client.config(config)).toEqual(client);
    expect(client.config()).toEqual(config);
  });
  it('should call /autosuggest when run is called', async () => {
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
    const language = CHANCE.locale();
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
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
    expect(transportSpy.calledOnceWith(transportArguments)).toEqual(true);
  });
  it('should call /autosuggest with voice input type', async () => {
    const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    const inputType = CHANCE.pickone([
      AutosuggestInputType.VoconHybrid,
      AutosuggestInputType.NMDP_ASR,
      AutosuggestInputType.GenericVoice,
    ]);
    const language = CHANCE.locale();
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };

    await client.run({
      input,
      inputType,
      language,
    });
    expect(transportSpy.calledOnceWith(transportArguments)).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
    }
  });
  it('should throw error if no options provided', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.run(undefined as any);
    } catch (err) {
      expect(err.message).toEqual('You must provide at least options.input');
    } finally {
      expect(transportSpy.notCalled).toEqual(true);
    }
  });
  it('should throw error if input is empty', async () => {
    const input = '';

    try {
      await client.run({ input });
    } catch (err) {
      expect(err.message).toEqual('You must specify an input value');
    } finally {
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
      expect(transportSpy.notCalled).toEqual(true);
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
        expect(transportSpy.notCalled).toEqual(true);
      }
    });
  });
  it('should throw error if language is not valid', async () => {
    const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    const language = 'abc';

    try {
      await client.run({ input, language });
    } catch (err) {
      expect(err.message).toEqual(
        'Invalid language code. It must be an ISO-639-1 2 letter code.'
      );
    } finally {
      expect(transportSpy.notCalled).toEqual(true);
    }
  });
  it('should call /autosuggest-selection with selected suggestion', async () => {
    const selected = generateAutosuggestSuggestion();
    const transportArguments = {
      method: 'post',
      host: `${host.replace(/\/$/, '')}/${apiVersion}`,
      url: '/autosuggest-selection',
      query: { key: apiKey },
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: {
        'raw-input': '',
        selection: selected.words,
        rank: selected.rank,
        'source-api': 'text',
      },
    };

    const actualOnSelected = await client.onSelected(selected);
    expect(actualOnSelected).toEqual(undefined);
    const actual = transportSpy.calledOnceWith(transportArguments);
    expect(actual).toEqual(true);
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
        method: 'post',
        host: `${host.replace(/\/$/, '')}/${apiVersion}`,
        url: '/autosuggest-selection',
        query: { key: apiKey },
        headers: { 'X-Api-Key': apiKey, ...HEADERS },
        body: {
          'raw-input': input,
          selection: selected.words,
          rank: selected.rank,
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
      };
    });

    it('text input type', async () => {
      const inputType = AutosuggestInputType.Text;
      transportArguments.body['input-type'] = inputType;
      transportArguments.body['source-api'] = 'text';

      const actualOnSelected = await client.onSelected(selected, {
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
      expect(actualOnSelected).toEqual(undefined);
      const actual = transportSpy.calledOnceWith(transportArguments);
      expect(actual).toEqual(true);
    });
    it('voice input type', async () => {
      const inputType = AutosuggestInputType.GenericVoice;
      transportArguments.body['input-type'] = inputType;
      transportArguments.body['source-api'] = 'voice';

      const actualOnSelected = await client.onSelected(selected, {
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
      expect(actualOnSelected).toEqual(undefined);
      const actual = transportSpy.calledOnceWith(transportArguments);
      expect(actual).toEqual(true);
    });
  });
});
