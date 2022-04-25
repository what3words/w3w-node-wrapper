export const W3W_REGEX =
  /[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}/gi;
export const VERSION = '__VERSION__';
export const HEADERS = {
  'X-W3W-Wrapper':
    typeof process === 'undefined'
      ? `what3words-JavaScript/${VERSION}`
      : `what3words-Node/${VERSION}`,
};
export const W3W_DNS_REGEXP =
  /^(http(s)?:\/\/)?(localhost|.+\.w3w\.io|.+\.what3words\.com)/i;
