import {
  Matchers,
  Pact,
  RequestOptions,
  ResponseOptions,
} from '@pact-foundation/pact';
import { Chance } from 'chance';
import * as path from 'path';
import { ApiVersion, AutosuggestClient } from '../../src';
import {
  BadGatewayError,
  ForbiddenError,
  GatewayTimeoutError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
} from '../../src/lib/transport/error';

const chance = new Chance();

describe('Autosuggest Session Pact', () => {
  const apiVersion = ApiVersion.Version3;
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

  const randomApiKey = chance.string({
    length: 8,
    alpha: true,
    numeric: true,
    symbols: false,
    casing: 'upper',
  });

  const genRandomDigit = () =>
    chance.string({
      length: 1,
      alpha: false,
      numeric: true,
      symbols: false,
      casing: 'lower',
    });
  const apiKey = Matchers.term({
    matcher: '[a-zA-Z0-9]{8}',
    generate: randomApiKey,
  }).getValue();
  const correlationId = Matchers.uuid().getValue();
  const randomVersion = [
    genRandomDigit(),
    genRandomDigit(),
    genRandomDigit(),
  ].join('.');
  const version = Matchers.term({
    matcher: '[0-9].[0-9].[0-9]',
    generate: randomVersion,
  }).getValue();
  const returnCoordinates = Matchers.boolean(chance.bool()).getValue();
  const typeheadDelay = Matchers.like(
    chance.integer({ min: 0, max: 500 })
  ).getValue();
  const variant = Matchers.like(
    chance.pickone(['default', 'inherit'])
  ).getValue() as never;

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
    describe('And there is a sucessful request to start a session', () => {
      const MOCK_REQUEST: RequestOptions = {
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
          version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          status: 200,
          message: 'ok',
        },
      };

      // Add interactions to the Mock Server, as many as required
      beforeAll(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'a successful request for an autosuggest session',
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
          version,
        });

        expect(res.headers).toHaveProperty('content-type', 'application/json');
        expect(res.headers).toHaveProperty('x-correlation-id', correlationId);
        expect(res.body).toHaveProperty('status', MOCK_RESPONSE.body.status);
        expect(res.body).toHaveProperty('message', MOCK_RESPONSE.body.message);
      });
    });

    describe('And there is a failed request to update the session', () => {
      const MOCK_REQUEST: RequestOptions = {
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
          version,
        },
      };

      const errors = [
        new ForbiddenError(),
        new NotFoundError(),
        new InternalServerError(),
        new BadGatewayError(),
        new ServiceUnavailableError(),
        new GatewayTimeoutError(),
      ];

      errors.forEach(err => {
        // Write your test(s)
        it(`should return a ${err.status} error`, async () => {
          const MOCK_RESPONSE: ResponseOptions = {
            status: err.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': correlationId,
            },
            body: {
              status: err.status,
              message: err.message,
            },
          };
          // Add interactions to the Mock Server, as many as required
          await provider.addInteraction({
            // The 'state' field specifies a "Provider State"
            state: 'I do not have a current autosuggest session',
            uponReceiving: `a ${err.status} failed request to update the session`,
            withRequest: MOCK_REQUEST,
            willRespondWith: MOCK_RESPONSE,
          });
          const client = new AutosuggestClient(apiKey, config);
          try {
            await client.startSession({
              apiKey,
              correlationId,
              returnCoordinates,
              typeheadDelay,
              variant,
              version,
            });
          } catch (error) {
            expect(error).toHaveProperty('status', err.status);
            expect(error.message.trim()).toBe(err.message);
          }
        });
      });
    });

    describe('And there is an unauthorized request', () => {
      it('should return a 401 error when apiKey is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'POST' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates: returnCoordinates,
            typehead_delay: typeheadDelay,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 401,
            message: 'Unauthorized',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is an unauthorised request without apiKey',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.startSession({
            apiKey: undefined,
            correlationId,
            returnCoordinates,
            typeheadDelay,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });
    });

    describe('And there is bad request ', () => {
      it('should return a 400 error when returnCoordinates is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'POST' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            typehead_delay: typeheadDelay,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 400,
            message: 'Bad Request',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is bad request without returnCoordinates',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.startSession({
            apiKey,
            correlationId,
            returnCoordinates: undefined,
            typeheadDelay,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });

      it('should return a 400 error when typeheadDelay is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'POST' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates: returnCoordinates,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 400,
            message: 'Bad Request',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is bad request without typeheadDelay',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.startSession({
            apiKey,
            correlationId,
            returnCoordinates,
            typeheadDelay: undefined,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });
    });
  });

  describe('When I have a current autosuggest session', () => {
    describe('And there is a request to update the session', () => {
      const MOCK_REQUEST: RequestOptions = {
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
          version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          status: 200,
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
          version,
        });

        expect(res.headers).toHaveProperty('content-type', 'application/json');
        expect(res.headers).toHaveProperty('x-correlation-id', correlationId);
        expect(res.body).toHaveProperty('status', 200);
      });
    });

    describe('And there is an unauthorized request', () => {
      it('should return a 401 error when apiKey is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'PUT' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates: returnCoordinates,
            typehead_delay: typeheadDelay,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 401,
            message: 'Unauthorized',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is an unauthorised request without apiKey',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.updateSession({
            apiKey: undefined,
            correlationId,
            returnCoordinates,
            typeheadDelay,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });
    });

    describe('And there is bad request ', () => {
      it('should return a 400 error when returnCoordinates is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'PUT' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            typehead_delay: typeheadDelay,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 400,
            message: 'Bad Request',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is bad request without returnCoordinates',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.updateSession({
            apiKey,
            correlationId,
            returnCoordinates: undefined,
            typeheadDelay,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });

      it('should return a 400 error when typeheadDelay is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'PUT' as const,
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates: returnCoordinates,
            variant,
            version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            status: 400,
            message: 'Bad Request',
          },
        };
        // Add interactions to the Mock Server, as many as required
        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is bad request without typeheadDelay',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        const client = new AutosuggestClient(apiKey, config);
        try {
          await client.updateSession({
            apiKey,
            correlationId,
            returnCoordinates,
            typeheadDelay: undefined,
            variant,
            version,
          });
        } catch (error) {
          expect(error).toHaveProperty('status', MOCK_RESPONSE.body.status);
          expect(error.message.trim()).toBe(MOCK_RESPONSE.body.message);
        }
      });
    });

    describe('And there is a failed request to update the session', () => {
      const MOCK_REQUEST: RequestOptions = {
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
          version,
        },
      };

      const errors = [
        new ForbiddenError(),
        new NotFoundError(),
        new InternalServerError(),
        new BadGatewayError(),
        new ServiceUnavailableError(),
        new GatewayTimeoutError(),
      ];

      errors.forEach(err => {
        // Write your test(s)
        it(`should return a ${err.status} error`, async () => {
          const MOCK_RESPONSE: ResponseOptions = {
            status: err.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': correlationId,
            },
            body: {
              status: err.status,
              message: err.message,
            },
          };
          // Add interactions to the Mock Server, as many as required
          await provider.addInteraction({
            // The 'state' field specifies a "Provider State"
            state: 'I already have a current autosuggest session',
            uponReceiving: `a ${err.status} failed request to update the session`,
            withRequest: MOCK_REQUEST,
            willRespondWith: MOCK_RESPONSE,
          });
          const client = new AutosuggestClient(apiKey, config);
          try {
            await client.updateSession({
              apiKey,
              correlationId,
              returnCoordinates,
              typeheadDelay,
              variant,
              version,
            });
          } catch (error) {
            expect(error).toHaveProperty('status', err.status);
            expect(error.message.trim()).toBe(err.message);
          }
        });
      });
    });
  });
});
