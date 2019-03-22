import { fetchGet } from "../fetch";

interface AvailableLanguagesResponse {
  languages: {
    code: string;
    name: string;
    nativeName: string;
  }[];
}
export const availableLanguages = (
  signal?: AbortSignal
): Promise<AvailableLanguagesResponse> => {
  return fetchGet("available-languages", {}, signal);
};
