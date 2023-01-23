import 'should';
import nock from 'nock';
import Chance from 'chance';
import what3words, {
  ClientRequest,
  TransportResponse,
  HEADERS,
  What3wordsService,
  ApiVersion,
} from '../../../src';
import superagent from 'superagent';

function customTransport<ResponseType>(
  request: ClientRequest
): Promise<TransportResponse<ResponseType>> {
  const {
    method,
    host,
    url,
    query = {},
    headers = {},
    body = {},
    format,
  } = request;
  return new Promise(resolve =>
    superagent[method](`${host}${url}`)
      .query({ ...query, format })
      .send(body || {})
      .set(headers)
      .end((err, res) => {
        if (err || !res)
          return resolve({
            status: err.status || 500,
            statusText: err.response.text || 'Internal Server Error',
            headers: err.headers || {},
            body: err.response.text || null,
          });
        const response: TransportResponse<ResponseType> = {
          status: res.status,
          statusText: res.text,
          headers: res.headers,
          body: res.body,
        };
        resolve(response);
      })
  );
}

const CHANCE = new Chance();
const MOCK_RESPONSE = { foo: 'bar' };
const MOCK_ERROR_RESPONSE = 'My custom error response message';

describe('Custom Transport', () => {
  const query = {
    example: 'params',
    random: 'value',
  };
  let host: string;
  let url: string;
  let method: 'get' | 'post';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let request: any;
  let service: What3wordsService;
  let api_key: string;

  beforeEach(() => {
    method = CHANCE.pickone(['get', 'post']);
    host = `http://${CHANCE.domain({})}`;
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
    api_key = CHANCE.string({ length: 8, symbols: false });
    service = what3words(api_key, { host }, { transport: customTransport });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should make request using custom transport and return 200', async () => {
    nock(host, { allowUnmocked: false })
      [method](url)
      .query(request.query)
      .reply(200, MOCK_RESPONSE, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    (await customTransport(request)).should.be.eql({
      status: 200,
      statusText: JSON.stringify(MOCK_RESPONSE),
      headers: { 'content-type': 'application/json;charset=utf-8' },
      body: MOCK_RESPONSE,
    });
  });

  it('should make request using custom transport and return 500', async () => {
    nock(host, { allowUnmocked: false })
      [method](url)
      .query(request.query)
      .reply(500, MOCK_ERROR_RESPONSE);

    (await customTransport(request)).should.be.eql({
      status: 500,
      statusText: MOCK_ERROR_RESPONSE,
      headers: {},
      body: MOCK_ERROR_RESPONSE,
    });
  });

  it('should call autosuggest and return results', async () => {
    const input = `${CHANCE.word()}.${CHANCE.word()}.${CHANCE.letter()}`;
    const options = { input };
    const mock_response = { suggestions: [] };

    nock(`${host}`, {
      reqheaders: {
        'X-Api-Key': api_key,
        ...HEADERS,
      },
      allowUnmocked: false,
    })
      .get(`/${ApiVersion.Version3}/autosuggest`)
      .query({ ...options, key: api_key })
      .reply(200, mock_response, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    const result = await service.autosuggest({ input });
    result.should.be.eql(mock_response);
  });

  it('should call available-languages and return results', async () => {
    const mock_response = { languages: [] };

    nock(`${host}`, {
      reqheaders: {
        'X-Api-Key': api_key,
        ...HEADERS,
      },
      allowUnmocked: false,
    })
      .get(`/${ApiVersion.Version3}/available-languages`)
      .query({ key: api_key })
      .reply(200, mock_response, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    const result = await service.availableLanguages();
    result.should.be.eql(mock_response);
  });

  it('should call convert-to-3wa and return json results', async () => {
    const mock_response = { languages: [] };
    const options = {
      coordinates: {
        lat: parseFloat(CHANCE.coordinates().split(', ')[0]),
        lng: parseFloat(CHANCE.coordinates().split(', ')[1]),
      },
      language: CHANCE.locale(),
    };

    nock(`${host}`, {
      reqheaders: {
        'X-Api-Key': api_key,
        ...HEADERS,
      },
      allowUnmocked: false,
    })
      .get(`/${ApiVersion.Version3}/convert-to-3wa`)
      .query({
        coordinates: `${options.coordinates.lat},${options.coordinates.lng}`,
        language: options.language,
        key: api_key,
      })
      .reply(200, mock_response, {
        'Content-Type': 'application/json;charset=utf-8',
      });

    const result = await service.convertTo3wa(options);
    result.should.be.eql(mock_response);
  });
});
