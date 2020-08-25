import { fetchGet } from './fetch.browser';

const length = (obj: any) => Object.keys(obj).length;
const first = ([head]) => head;
const params = ([_, args]) => args;

describe('fetchGet', () => {
  beforeEach(() => {
    fetch.resetMocks();
  })

  it('should send "X-W3W-Wrapper" header', () => {
    fetch.mockResponseOnce(JSON.stringify({ ok: true }))
    const response = fetchGet('test');
    const request = first(fetch.mock.calls);
    const { headers } = params(request);
    const numberOfHeaders = length(headers);
    const wrapperHeader = headers["X-W3W-Wrapper"];
    expect(numberOfHeaders).toBe(1);
    expect(wrapperHeader).not.toBeUndefined();
  })
})