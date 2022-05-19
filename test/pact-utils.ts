import { Pact, RequestOptions, ResponseOptions } from '@pact-foundation/pact';
import { PactOptions } from '@pact-foundation/pact/src/dsl/options';
import * as path from 'path';

/**
 * Create a pre-configured Pact provider
 */
function createPact(opts: Omit<PactOptions, 'consumer'>) {
  return new Pact({
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    pactfileWriteMode: 'overwrite',
    port: 9000,
    consumer: 'w3w-node-wrapper',
    ...opts,
  });
}

/**
 * Create a mock request for a Pact interaction (`withRequest` property)
 */
function createMockRequest(opts: RequestOptions): RequestOptions {
  return opts;
}

/**
 * Create a mock response for a Pact interaction (`willRespondWith` property)
 */
function createMockResponse(opts: ResponseOptions): ResponseOptions {
  return opts;
}

const PactUtils = {
  createPact,
  createMockRequest,
  createMockResponse,
};

export default PactUtils;
