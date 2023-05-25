import { platform, release } from 'os';
import { getPlatform } from './serializer';

export const W3W_REGEX =
  /[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}/gi;
export const VERSION = '__VERSION__';
export const HEADERS = {
  'X-W3W-Wrapper':
    typeof window !== 'undefined'
      ? `what3words-JavaScript/${VERSION} (${window.navigator.userAgent})`
      : `what3words-Node/${VERSION} (Node ${process.version}; ${getPlatform(
          platform()
        )} ${release()})`,
};
