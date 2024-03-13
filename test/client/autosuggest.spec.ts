import 'should';
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
import { languages } from '../../src/lib/languages/language-codes';

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
    client.should.be.instanceOf(AutosuggestClient);
    client.should.have.properties([
      '_apiKey',
      'apiKey',
      '_config',
      'config',
      'lastReqOpts',
      'onSelected',
      'run',
      'transport',
    ]);
    client['_apiKey'].should.be
      .String()
      .and.equal(apiKey, 'api key does not match');
    client['_config'].should.be
      .Object()
      .and.eql(config, 'config does not match');
    client['lastReqOpts'].should.be
      .Object()
      .and.be.eql({ input: '' }, 'lastReqOpts does not match');
    client.apiKey.should.be.Function();
    client.config.should.be.Function();
    client.onSelected.should.be.Function();
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
    const defaultConfig = { host, apiVersion, headers: {} };
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
    transportSpy
      .calledOnceWith(transportArguments)
      .should.be.equal(true, 'transport arguments do not match');
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };

    await client.run({
      input,
      inputType,
      language,
    });
    transportSpy
      .calledOnceWith(transportArguments)
      .should.be.equal(true, 'transport arguments do not match');
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
    } catch (err: any) {
      err.message.should.be.equal(
        'You must provide language when using a speech input type'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
    }
  });
  it('should throw error if no options provided', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.run(undefined as any);
    } catch (err: any) {
      err.message.should.be.equal('You must provide at least options.input');
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
    }
  });
  it('should throw error if input is empty', async () => {
    const input = '';

    try {
      await client.run({ input });
    } catch (err: any) {
      err.message.should.be.equal('You must specify an input value');
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
    } catch (err: any) {
      err.message.should.be.equal(
        'Southwest lat must be less than or equal to northeast lat and southwest lng must be less than or equal to northeast lng'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
    } catch (err: any) {
      err.message.should.be.equal(
        'Southwest lat must be less than or equal to northeast lat and southwest lng must be less than or equal to northeast lng'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
    } catch (err: any) {
      err.message.should.be.equal(
        'Invalid clip to country. All values must be an ISO 3166-1 alpha-2 country code'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
    } catch (err: any) {
      err.message.should.be.equal(
        'Invalid clip to polygon value. Array must contain at least 4 coordinates and no more than 25'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
    } catch (err: any) {
      err.message.should.be.equal(
        'Invalid clip to polygon value. The polygon bounds must be closed.'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
    }
  });
  it('should throw error if inputType is not valid', async () => {
    const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    const inputType = 'abc' as AutosuggestInputType;

    try {
      await client.run({ input, inputType });
    } catch (err: any) {
      err.message.should.be.equal(
        'Invalid input type provided. Must provide a valid input type.'
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
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
      } catch (err: any) {
        err.message.should.be.equal(
          'You must provide language when using a speech input type'
        );
      } finally {
        transportSpy.notCalled.should.be.equal(
          true,
          'transport should not be called'
        );
      }
    });
  });
  it('should throw error if language is not valid', async () => {
    const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    const language = 'abc';

    try {
      await client.run({ input, language });
    } catch (err: any) {
      err.message.should.be.equal(
        `The language ${language} is not supported. Refer to our API for supported languages.`
      );
    } finally {
      transportSpy.notCalled.should.be.equal(
        true,
        'transport should not be called'
      );
    }
  });
  it('should call /autosuggest-selection with selected suggestion', async () => {
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
      headers: { 'X-Api-Key': apiKey, ...HEADERS },
      body: null,
    };

    await client.onSelected(selected).should.resolvedWith(undefined);
    console.log(transportSpy.args[0][0], transportArguments);
    transportSpy
      .calledOnceWith(transportArguments)
      .should.be.equal(true, 'transport arguments do not match');
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
        headers: { 'X-Api-Key': apiKey, ...HEADERS },
        body: null,
      };
    });

    it('text input type', async () => {
      const inputType = AutosuggestInputType.Text;
      transportArguments.query['input-type'] = inputType;
      transportArguments.query['source-api'] = 'text';

      await client
        .onSelected(selected, {
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
        .should.resolvedWith(undefined);
      transportSpy
        .calledOnceWith(transportArguments)
        .should.be.equal(true, 'transport arguments do not match');
    });
    it('voice input type', async () => {
      const inputType = AutosuggestInputType.GenericVoice;
      transportArguments.query['input-type'] = inputType;
      transportArguments.query['source-api'] = 'voice';

      await client
        .onSelected(selected, {
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
        .should.resolvedWith(undefined);
      transportSpy
        .calledOnceWith(transportArguments)
        .should.be.equal(true, 'transport arguments do not match');
    });
  });

  describe.only('methods', () => {
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

    describe('findPossible3wa', () => {
      it('should return an empty array if empty string is provided', async () => {
        client.findPossible3wa('').should.be.empty();
      });

      describe('invalid value', () => {
        const invalidSubstrings = invalidStrings.map(
          v => `text with invalid three word address: ${v}`
        );

        invalidStrings.forEach(invalidString => {
          it(`should return an empty array if "${invalidString}" is provided`, async () => {
            client.findPossible3wa(invalidString).should.be.empty();
          });
        });

        invalidSubstrings.forEach(invalidSubstring => {
          it(`should return an empty array if "${invalidSubstring}" is provided`, async () => {
            client.findPossible3wa(invalidSubstring).should.be.empty();
          });
        });
      });

      describe('valid value', () => {
        const validSubstrings = validStrings.map(
          v => `text with valid three word address: ${v}`
        );

        validStrings.forEach(validString => {
          it(`should return a match if "${validString}" is provided`, async () => {
            client.findPossible3wa(validString).should.containEql(validString);
          });
        });

        validSubstrings.forEach(substring => {
          it(`should return a match if "${substring}" is provided`, async () => {
            client
              .findPossible3wa(substring)
              .every(res => validStrings.includes(res))
              .should.be.true();
          });
        });
      });
    });

    describe('isPossible3wa', () => {
      it('should return false if empty string is provided', async () => {
        client.isPossible3wa('').should.be.false();
      });
      invalidStrings.forEach(invalidString => {
        it(`should return false if "${invalidString}" is provided`, async () => {
          client.isPossible3wa(invalidString).should.be.false();
        });
      });
      validStrings.forEach(validString => {
        it(`should return true if "${validString}" is provided`, async () => {
          client.isPossible3wa(validString).should.be.true();
        });
      });
    });
  });
});
