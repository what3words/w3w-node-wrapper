import {
  Matchers,
  Pact,
  RequestOptions,
  ResponseOptions,
} from '@pact-foundation/pact';
import { Chance } from 'chance';
import * as path from 'path';
import should from 'should';
import { assert, createSandbox, SinonSandbox } from 'sinon';
import { ApiVersion, AutosuggestClient } from '../../src';
import { generateRandomDigit } from '../fixtures';

const chance = new Chance();

describe('Autosuggest Session Pact', () => {
  const randomApiKey = chance.string({
    length: 8,
    alpha: true,
    numeric: true,
    symbols: false,
    casing: 'upper',
  });
  const apiKey = Matchers.term({
    matcher: '[a-zA-Z0-9]{8}',
    generate: randomApiKey,
  }).getValue();
  const correlationId = Matchers.uuid().getValue();
  const randomVersion = [
    generateRandomDigit(),
    generateRandomDigit(),
    generateRandomDigit(),
  ].join('.');
  const component_version = Matchers.term({
    matcher: '[0-9].[0-9].[0-9](-[a-zA-Z]+.d+)?',
    generate: randomVersion,
  }).getValue();
  const return_coordinates = Matchers.boolean(chance.bool()).getValue();
  const typehead_delay = Matchers.like(
    chance.integer({ min: 0, max: 500 })
  ).getValue();
  const variant = Matchers.like(
    chance.pickone(['default', 'inherit'])
  ).getValue() as never;
  const apiVersion = ApiVersion.Version3;
  const port = 9000;
  const host = `http://localhost:${port}`;
  const provider = new Pact({
    consumer: 'w3w-node-wrapper',
    provider: 'api-server',
    port,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    pactfileWriteMode: 'overwrite',
  });
  let client: AutosuggestClient;

  before(() => provider.setup());

  beforeEach(() => {
    client = new AutosuggestClient(apiKey, { host, apiVersion });
  });

  afterEach(() => provider.verify());

  after(() => provider.finalize());

  describe('When I do not have a current autosuggest session', () => {
    describe('And there is a successful request to start a session', () => {
      const MOCK_REQUEST: RequestOptions = {
        method: 'POST',
        path: `/${apiVersion}/autosuggest-session`,
        query: {
          key: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 202,
        headers: {
          'X-Correlation-ID': correlationId,
        },
      };

      beforeEach(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'a successful request for an autosuggest session',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      it('should start a session and returns 202 response', async () => {
        const res = await client.startSession(correlationId, {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        should(res?.headers).have.properties({
          'x-correlation-id': correlationId,
        });
        should(res).have.properties({
          status: MOCK_RESPONSE.status,
        });
      });
    });

    describe('And there is a request to update the session', () => {
      it('should return a 400 error', async () => {
        try {
          await client.updateSession({
            return_coordinates,
            typehead_delay,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: 400,
            message: 'Bad Request',
          });
        }
      });
    });

    describe('And there is an unauthorized request', () => {
      const MOCK_REQUEST: RequestOptions = {
        method: 'POST',
        path: `/${apiVersion}/autosuggest-session`,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 401,
      };

      beforeEach(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is an unauthorised request without apiKey',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      it('should return a 401 error when apiKey is missing', async () => {
        client.apiKey();

        try {
          await client.startSession(correlationId, {
            return_coordinates,
            typehead_delay,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });
    });

    describe('And there is bad request ', () => {
      it('should return a 400 error when return_coordinates is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'POST',
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            typehead_delay: typehead_delay,
            variant,
            component_version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
        };

        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is bad request without return_coordinates',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });

        try {
          await client.startSession(correlationId, {
            typehead_delay,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });

      it('should return a 400 error when typehead_delay is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'POST',
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates,
            variant,
            component_version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
        };

        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I do not have a current autosuggest session',
          uponReceiving: 'And there is bad request without typehead_delay',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });

        try {
          await client.startSession(correlationId, {
            return_coordinates,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });
    });
  });

  describe('When I have a current autosuggest session', () => {
    const SESSION_MOCK_REQUEST: RequestOptions = {
      method: 'POST',
      path: `/${apiVersion}/autosuggest-session`,
      query: {
        key: apiKey,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
    };
    const SESSION_MOCK_RESPONSE: ResponseOptions = {
      status: 202,
      headers: {
        'X-Correlation-ID': correlationId,
      },
    };

    beforeEach(async () => {
      await provider.addInteraction({
        // The 'state' field specifies a "Provider State"
        state: 'I start an autosuggest session',
        uponReceiving: 'a request to create the session',
        withRequest: SESSION_MOCK_REQUEST,
        willRespondWith: SESSION_MOCK_RESPONSE,
      });
      await client.startSession(correlationId);
    });

    describe('And there is a request to update the session', () => {
      const MOCK_REQUEST: RequestOptions = {
        method: 'PUT',
        path: `/${apiVersion}/autosuggest-session`,
        query: {
          key: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 202,
        headers: {
          'X-Correlation-ID': correlationId,
        },
      };

      beforeEach(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I already have a current autosuggest session',
          uponReceiving: 'a request to update the session',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      it('should update the session and returns 202 response', async () => {
        const res = await client.updateSession({
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        should(res?.headers).have.properties({
          'x-correlation-id': correlationId,
        });
        should(res).have.property('status', 202);
      });
    });

    describe('And there is an unauthorized request', () => {
      const MOCK_REQUEST: RequestOptions = {
        method: 'PUT',
        path: `/${apiVersion}/autosuggest-session`,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        },
      };
      const MOCK_RESPONSE: ResponseOptions = {
        status: 401,
      };

      beforeEach(() =>
        provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is an unauthorised request without apiKey',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        })
      );

      it('should return a 401 error when apiKey is missing', async () => {
        client.apiKey();

        try {
          await client.updateSession({
            return_coordinates,
            typehead_delay,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });
    });

    describe('And there is bad request ', () => {
      it('should return a 400 error when return_coordinates is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'PUT',
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            typehead_delay,
            variant,
            component_version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
        };

        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is bad request without return_coordinates',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });

        try {
          await client.updateSession({
            typehead_delay,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });

      it('should return a 400 error when typehead_delay is missing', async () => {
        const MOCK_REQUEST: RequestOptions = {
          method: 'PUT',
          path: `/${apiVersion}/autosuggest-session`,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: {
            return_coordinates,
            variant,
            component_version,
          },
        };
        const MOCK_RESPONSE: ResponseOptions = {
          status: 400,
        };

        await provider.addInteraction({
          // The 'state' field specifies a "Provider State"
          state: 'I have a current autosuggest session',
          uponReceiving: 'And there is bad request without typehead_delay',
          withRequest: MOCK_REQUEST,
          willRespondWith: MOCK_RESPONSE,
        });
        try {
          await client.updateSession({
            return_coordinates,
            variant,
            component_version,
          });
        } catch (error) {
          should(error).have.properties({
            status: MOCK_RESPONSE.status,
          });
        }
      });
    });

    describe('And there is a request to update an autosuggest session with a w3w DNS', () => {
      let sandbox: SinonSandbox;

      beforeEach(() => {
        sandbox = createSandbox();
      });

      afterEach(() => {
        sandbox.reset();
      });

      it('should make a request to endpoint with www.what3words.com as a host', async () => {
        const transport = sandbox.spy();
        const client = AutosuggestClient.init(
          apiKey,
          {
            apiVersion,
            host: 'www.what3words.com',
          },
          transport
        );
        const correlationId = chance.guid();

        await client.startSession(correlationId, {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });
        await client.updateSession({
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        assert.calledTwice(transport);
      });

      it('should make a request to endpoint with london.dev.w3w.io as a host', async () => {
        const transport = sandbox.spy();
        const client = AutosuggestClient.init(
          apiKey,
          {
            apiVersion,
            host: 'london.dev.w3w.io',
          },
          transport
        );
        const correlationId = chance.guid();

        await client.startSession(correlationId, {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });
        await client.updateSession({
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        assert.calledTwice(transport);
      });

      it('should make a request to endpoint with localhost as a host', async () => {
        const transport = sandbox.spy();
        const client = AutosuggestClient.init(
          apiKey,
          {
            apiVersion,
            host: 'localhost:9999',
          },
          transport
        );
        const correlationId = chance.guid();

        await client.startSession(correlationId, {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });
        await client.updateSession({
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        assert.calledTwice(transport);
      });
    });

    describe('And there is a request to update an autosuggest session with a private DNS', () => {
      let sandbox: SinonSandbox;
      let host: string;

      beforeEach(() => {
        sandbox = createSandbox();
        host = chance.domain();
      });

      afterEach(() => {
        sandbox.reset();
      });

      it('should not make a request', async () => {
        const transport = sandbox.spy();
        const client = AutosuggestClient.init(
          apiKey,
          {
            apiVersion,
            host,
          },
          transport
        );
        const correlationId = chance.guid();

        await client.startSession(correlationId, {
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });
        await client.updateSession({
          return_coordinates,
          typehead_delay,
          variant,
          component_version,
        });

        assert.notCalled(transport);
      });
    });
  });
});