import { platform, release } from 'os';
import { getPlatform } from './serializer';

/**
 * @constant {RegExp}
 * Regex pattern derived from https://github.com/what3words/w3w-python-wrapper/blob/master/what3words/what3words.py#L284
 */
export const W3W_REGEX =
  /[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}/gi;

/**
 * @constant {RegExp}
 * Regex pattern derived from https://github.com/what3words/w3w-python-wrapper/blob/master/what3words/what3words.py#L298
 */
export const W3W_POSSIBLE_REGEX =
  /^\/*(?:[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}|'<,.>?\/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+|[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3})$/gi;
export const VERSION = '__VERSION__';
export const HEADERS = {
  'X-W3W-Wrapper':
    typeof window !== 'undefined'
      ? `what3words-JavaScript/${VERSION}`
      : `what3words-Node/${VERSION} (Node ${process.version}; ${getPlatform(
          platform()
        )} ${release()})`,
};
