import { Pact, Matchers } from '@pact-foundation/pact';
import * as path from 'path';
import { ApiVersion, AutosuggestClient } from '../../src';

describe('Autosuggest Session Pact', () => {
  const apiVersion = ApiVersion.Version1;
  const port = 9000;
  const host = `http://localhost:${port}`;
  const config = { host, apiVersion, headers: {} };

  // Create the Pact object to represent your provider
  const provider = new Pact({
    consumer: 'w3w-node-wrapper',
    provider: 'api-server',
    port,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    pactfileWriteMode: 'overwrite',
  });

  const apiKey = Matchers.uuid().getValue();
  const correlationId = Matchers.uuid().getValue();
  const version = Matchers.like('1.2.3').getValue();
  const returnCoordinates = Matchers.boolean().getValue();
  const typeheadDelay = Matchers.like(400).getValue();
  const variant = Matchers.like('default' as const).getValue();

  // Start the mock server
  beforeAll(() => provider.setup());

  // Validate the interactions you've registered and expected occurred
  // this will throw an error if it fails telling you what went wrong
  // This should be performed once per interaction test
  afterEach(() => provider.verify());

  // Write the pact file for this consumer-provider pair,
  // and shutdown the associated mock server.
  // You should do this only _once_ per Provider you are testing,
  // and after _all_ tests have run for that suite
  afterAll(() => provider.finalize());

  describe('When I do not have a current autosuggest session', () => {
    describe('And there is a request to start a session', () => {
      const MOCK_REQUEST = {
        method: 'POST' as const,
        path: `/${apiVersion}/autosuggest-session`,
        query: {
          key: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates: returnCoordinates,
          typehead_delay: typeheadDelay,
          variant,
        },
      };
      const MOCK_RESPONSE = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          version,
        },
      };

      // Add interactions to the Mock Server, as many as required
      beforeAll(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'a request for an autosuggest session',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      // Write your test(s)
      it('should start a session and returns the autosuggest sdk version', async () => {
        const client = new AutosuggestClient(apiKey, config);
        const res = await client.startSession({
          apiKey,
          correlationId,
          returnCoordinates,
          typeheadDelay,
          variant,
        });

        expect(res.headers).toHaveProperty('content-type', 'application/json');
        expect(res.headers).toHaveProperty('x-correlation-id', correlationId);
        expect(res.body).toHaveProperty('version', version);
      });
    });
  });

  describe('When I already have a current autosuggest session', () => {
    describe('And there is a request to update the session', () => {
      const MOCK_REQUEST = {
        method: 'PUT' as const,
        path: `/${apiVersion}/autosuggest-session`,
        query: {
          key: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates: returnCoordinates,
          typehead_delay: typeheadDelay,
          variant,
        },
      };
      const MOCK_RESPONSE = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          version,
        },
      };

      beforeAll(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I already have a current autosuggest session',
          uponReceiving: 'a request to update the session',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      it('should udpate the session and returns the autosuggest sdk version', async () => {
        const client = new AutosuggestClient(apiKey, config);
        const res = await client.updateSession({
          apiKey,
          correlationId,
          returnCoordinates,
          typeheadDelay,
          variant,
        });

        expect(res.headers).toHaveProperty('content-type', 'application/json');
        expect(res.headers).toHaveProperty('x-correlation-id', correlationId);
        expect(res.body).toHaveProperty('version', version);
      });
    });
  });
});
