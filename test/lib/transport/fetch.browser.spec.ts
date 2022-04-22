import 'should';
import nock from 'nock';
import { Chance } from 'chance';
import { useEffect } from 'react';
import { renderComponent, setup } from '../../setup';
import { fetchTransport, HEADERS, searchParams } from '../../../src';

const CHANCE = new Chance();

describe('Fetch Transport - Browser ', () => {
  const query = {
    example: 'params',
    random: 'value',
  };
  let host: string;
  let url: string;
  let method: 'get' | 'post';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let request: any;

  beforeEach(() => {
    method = CHANCE.pickone(['get', 'post']);
    host = CHANCE.url();
    url = '/foo/bar';
    request = {
      method,
      host,
      url,
      query,
      headers: {
        'X-Custom-Header': 'my-random-header-value',
        ...HEADERS,
      },
      body: null,
    };
    setup();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should make a request given a ClientRequest and return JSON', async () => {
    const response = { foo: 'bar' };
    nock(host)
      [method](`${url}?${searchParams(request.query)}`)
      .reply(200, response, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    await renderComponent(res => {
      useEffect(() => {
        fetchTransport()(request).then(result => {
          window.result = result;
          res(null);
        });
      }, []);
    });

    window.result.should.be.eql({
      status: 200,
      statusText: 'OK',
      body: response,
      headers: { 'content-type': 'application/json;charset=utf-8' },
    });
  });

  it('should make a request given a ClientRequest and return string', async () => {
    const response = CHANCE.sentence();
    nock(host)
      [method](`${url}?${searchParams(request.query)}`)
      .reply(200, response);

    await renderComponent(res => {
      useEffect(() => {
        fetchTransport()(request).then(result => {
          window.result = result;
          res(null);
        });
      }, []);
    });

    window.result.should.be.eql({
      status: 200,
      statusText: 'OK',
      body: response,
      headers: {},
    });
  });

  it('should make a request given a ClientRequest (no query params)', async () => {
    const response = CHANCE.sentence();
    delete request.query;
    nock(host)[method](url).reply(200, response);

    await renderComponent(res => {
      useEffect(() => {
        fetchTransport()(request).then(result => {
          window.result = result;
          res(null);
        });
      }, []);
    });

    window.result.should.be.eql({
      status: 200,
      statusText: 'OK',
      body: response,
      headers: {},
    });
  });

  describe('Errors', () => {
    const errorStatuses = [
      { status: 400, message: 'Bad Request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 404, message: 'Not Found' },
      { status: 500, message: 'Internal Server Error' },
      { status: 502, message: 'Bad Gateway' },
      { status: 503, message: 'Service Unavailable' },
      { status: 504, message: 'Gateway Timeout' },
    ];
    errorStatuses.forEach(({ status, message }) => {
      it(`should handle ${status} errors`, async () => {
        nock(host)
          [method](`${url}?${searchParams(query)}`)
          .reply(status);

        await renderComponent(res => {
          useEffect(() => {
            fetchTransport()(request).catch(error => {
              window.result = {
                message: error.message,
                status: error.status,
              };
              res(null);
            });
          }, []);
        });

        window.result.should.be.eql({ status, message });
      });
    });
  });
});
