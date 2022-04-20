import path from 'path';
import { Chance } from 'chance';
import { Pact, Matchers } from '@pact-foundation/pact';
import { ApiVersion, AutosuggestClient } from '../../src';

const CHANCE = new Chance();

describe.only('Autosuggest Pact Test', () => {
  const port = 9000;
  const apiVersion = ApiVersion.Version3;
  let provider: Pact;
  let key: string;

  before(() => {
    provider = new Pact({
      consumer: 'w3w-node-wrapper',
      provider: 'api-server',
      port,
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'pact'),
      logLevel: 'debug',
      pactfileWriteMode: 'overwrite',
    });
  });

  beforeEach(() => {
    key = CHANCE.string({
      length: 8,
      alpha: true,
      numeric: true,
      symbols: false,
      casing: 'upper',
    });
    return provider.setup();
  });

  afterEach(() => {
    provider.verify();
  });

  after(() => {
    provider.finalize();
  });

  describe('Calling autosuggest', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'I retrieve autosuggest results',
        uponReceiving: 'a valid request for autosuggest',
        withRequest: {
          method: 'GET',
          path: `/${apiVersion}/autosuggest`,
          query: {
            input: Matchers.string(),
            key: Matchers.term({
              matcher: '[a-zA-Z0-9]{8}',
              generate: key,
            }),
          },
          headers: {
            Accept: '*/*',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: Matchers.eachLike(
            {
              country: Matchers.term({
                matcher: '[a-zA-Z]{2}',
                generate: CHANCE.country(),
              }),
              nearestPlace: Matchers.term({
                matcher: '.+',
                generate: CHANCE.city(),
              }),
              words: Matchers.term({
                matcher: '[a-zA-Z]+.[a-zA-Z]+.[a-zA-Z]+',
                generate: `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.word()}`,
              }),
              distanceToFocusKm: Matchers.integer(),
              rank: Matchers.integer(),
              language: Matchers.term({
                matcher: '[a-zA-Z]{2}(-[a-zA-Z]{3})?',
                generate: CHANCE.locale(CHANCE.bool() ? { region: true }: undefined),
              }),
            },
            { min: 3 }
          ),
        },
      });
    });

    it('should generate a pact', async () => {
      const client = new AutosuggestClient(key, {
        apiVersion,
        host: `http://localhost:${port}`,
        headers: {
          'X-Correlation-Id': CHANCE.guid(),
        },
      });

      await client.run({
        input: 'a.b.c',
      });
    });
  });
});
