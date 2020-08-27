import fetch from "jest-fetch-mock";
import { fetchGet } from './fetch.browser';
import { version } from "./version";
import { setOptions } from "./utils";

const length = (obj: {}) => Object.keys(obj).length;
const first = <T>([ head ]: T[]) => head;
const params = <T, U>([ _, args ]: [ T, U ]) =>  args;

describe('fetchGet', () => {
  beforeEach(() => {
    fetch.resetMocks();
  })

  it('should send "X-W3W-Wrapper" header', async () => {
    fetch.mockResponseOnce(JSON.stringify({ ok: true }));

    const response = await fetchGet('test');
    const request = first(( fetch.mock.calls as [string, RequestInit][] ));
    const param = params(request);
    const headers = param.headers as { [headers: string]: string };
    const numberOfHeaders = length(headers);
    const wrapperHeader = headers["X-W3W-Wrapper"];

    expect(numberOfHeaders).toBe(1);
    expect(wrapperHeader).toBe(`what3words-JavaScript/${version} (${navigator.userAgent})`);
  })

  it('should allow additional headers to be set', () => {
    const testHeaderKey = 'X-W3W-Test';
    const testHeaderValue = `what3words-test/${version} (test)`;

    fetch.mockResponseOnce(JSON.stringify({ ok: true }));

    setOptions({
      'headers': {
        ['X-W3W-Test']: `what3words-test/${version} (test)`
      }
    });

    const response = fetchGet('test');
    const request = first(( fetch.mock.calls as [string, RequestInit][] ));
    const param = params(request);
    const headers = param.headers as { [headers: string]: string };
    const numberOfHeaders = length(headers);
    const testHeader = headers[testHeaderKey];
    expect(numberOfHeaders).toBe(2);
    expect(testHeader).toBe(testHeaderValue);
  })
})