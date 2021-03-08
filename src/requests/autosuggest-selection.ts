import { fetchGet } from '../fetch'
import { AutosuggestOptions, autosuggestOptionsToQuery } from './autosuggest'

export const autosuggestSelection = (
  rawInput: string,
  selection: string,
  rank: number,
  options: AutosuggestOptions = {},
  sourceApi: 'text' | 'voice' = 'text',
): Promise<null> => {
  return fetchGet("autosuggest-selection", {
    'raw-input': rawInput,
    selection,
    rank: rank.toString(),
    'source-api': sourceApi,
    ...autosuggestOptionsToQuery(options)
  });
};
