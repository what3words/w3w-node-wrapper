import nock from 'nock';
import { Chance } from 'chance';
import { axiosTransport, HEADERS, searchParams } from '@/.';

const CHANCE = new Chance();
const MOCK_RESPONSE = { foo: 'bar' };
const MOCK_ERROR_RESPONSE = 'My custom error response message';

describe('Axios Transport', () => {
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
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should make a request given a ClientRequest', async () => {
    nock(host)
      [method](`${url}?${searchParams(request.query)}`)
      .reply(200, MOCK_RESPONSE, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    expect(await axiosTransport()(request)).toMatchObject({
      status: 200,
      statusText: null,
      headers: {
        'content-type': 'application/json;charset=utf-8',
      },
      body: MOCK_RESPONSE,
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
          .reply(status, MOCK_ERROR_RESPONSE);

        try {
          expect(await axiosTransport()(request)).toEqual(MOCK_ERROR_RESPONSE);
        } catch (err) {
          expect(err).toHaveProperty('message');
          expect(err).toHaveProperty('status');
          expect(err.message).toEqual(message);
          expect(err.status).toEqual(status);
        }
      });
    });
  });
});
