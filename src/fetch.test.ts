import axios from 'axios';
import { fetchGet } from './fetch';
import { version } from "./version";
import { setOptions, getPlatform } from "./utils";
import * as os from 'os';

const first = <T>([ head ]: T[]) => head;
const getHeaders = (call:any) =>  call.headers;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const platform = getPlatform(os.platform());

describe('fetchGet', () => {

  it('should send "X-W3W-Wrapper" header', () => {
    mockedAxios.request.mockResolvedValue(JSON.stringify({ ok: true }));

    const response = fetchGet('test');
    const call = first(mockedAxios.request.mock.calls);
    const request = first(call);
    const headers = getHeaders(request);

    expect(headers).toEqual({
      'X-W3W-Wrapper': `what3words-Node/${version} (Node ${process.version}; ${platform} ${os.release()})`
    })
  })

  it('should allow additional headers to be set', () => {
    const testHeaderKey = 'X-W3W-Test';
    const testHeaderValue = `what3words-test/${version} (test)`;

    mockedAxios.request.mockResolvedValue(JSON.stringify({ ok: true }));

    setOptions({
      'headers': {
        'X-W3W-Test': `what3words-test/${version} (test)`
      }
    });

    const response = fetchGet('test');
    const call = first(mockedAxios.request.mock.calls);
    const request = first(call);
    const headers = getHeaders(request);

    expect(headers).toEqual({
      'X-W3W-Wrapper': `what3words-Node/${version} (Node ${process.version}; ${platform} ${os.release()})`,
      'X-W3W-Test': `what3words-test/${version} (test)`
    });
  })
})