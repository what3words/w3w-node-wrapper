import { RequestParams } from './client';

export type UtilisationFn = (
  path: string,
  data?: RequestParams
) => RequestParams | null;

/**
 * Default utilisation function callback.
 * Returns the modified RequestParams based on the provided path.
 * @param path - The path to determine the modification.
 * @param params - The optional RequestParams object.
 * @returns The modified RequestParams or null if the path is not recognized.
 */
export const utilisationFn = (
  path: string,
  params?: RequestParams
): RequestParams | null => {
  const { headers, query } = params ?? {};
  switch (path) {
    case '/autosuggest':
    case '/available-languages':
    case '/convert-to-3wa':
    case '/convert-to-coordinates':
    case '/grid-section':
      return {
        headers,
        body: {
          ...query,
        },
      };
    case '/autosuggest-selection':
    default:
      return null;
  }
};
