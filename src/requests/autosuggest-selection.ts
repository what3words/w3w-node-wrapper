import { fetchGet } from '../fetch'
import { getOptions } from '../utils';
import { AutosuggestOptions, autosuggestOptionsToQuery } from './autosuggest'

export const autosuggestSelection = (
  rawInput: string,
  selection: string,
  rank: number,
  options: AutosuggestOptions = {},
  sourceApi: 'text' | 'voice' = 'text',
): Promise<null> => {
  const W3W_DOMAIN_REGEX = /^[\w.-_]*.(what3words.com|w3w.io){1}/ig
  const baseUrl = getOptions().baseUrl
  if (baseUrl && !W3W_DOMAIN_REGEX.test(baseUrl)) return Promise.resolve(null)
  return fetchGet("autosuggest-selection", {
    'raw-input': rawInput,
    selection,
    rank: rank.toString(),
    'source-api': sourceApi,
    ...autosuggestOptionsToQuery(options)
  });
};
