import what3words, {
  axiosTransport,
  ApiVersion,
  W3W_REGEX,
} from '@what3words/api';

// SETUP
const COMPONENT_SELECTOR = 'div#w3w-autosuggest';
const INPUT_SELECTOR = 'input#autosuggest';
const SUGGESTIONS_SELECTOR = 'div#suggestions';
const W3W_API_KEY = process.env.W3W_API_KEY;
const W3W_API_ENDPOINT = process.env.W3W_API_ENDPOINT;

// DECLARATIONS
let component, input, selected;

/**
 * Retrieves suggestions from the what3words API given a search string
 */
async function getSuggestions(search) {
  /**
   * @see {@link https://developer.what3words.com/tutorial/nodejs#usage|Node/Javascript Wrapper}
   */
  const { suggestions } = await window.what3words
    .autosuggest({
      input: search,
    })
    .catch(err => {
      // you should do something with this
      console.error(err);

      // Return no suggestions
      return { suggestions: [] };
    });

  return suggestions;
}

/**
 * Clears the suggestions and removes the elements from the DOM.
 * TODO - this should probably tear down and remove event listeners that have been attached.
 */
function clearSuggestions() {
  const div = document.createElement('div');
  document.querySelector(SUGGESTIONS_SELECTOR).remove();
  div.id = 'suggestions';
  component.append(div);
}

/**
 * Handler for when a suggestion is selected
 */
async function selectedSuggestion(suggestion) {
  // Inform our API which suggestion was selected.
  await window.what3words.autosuggestSelection(suggestion);
  // Update input with selected suggestion
  input.value = `///${suggestion.words}`;
  selected = suggestion;
  console.log(`Three word address selected: ${JSON.stringify(selected)}`);
  // Clear suggestions as a selection has been made
  clearSuggestions();
}

/**
 * Handler for when suggestions are returned from the API
 */
function displaySuggestions(suggestions = []) {
  const parent = document.querySelector(SUGGESTIONS_SELECTOR);
  const div = document.createElement('div');

  for (const suggestion of suggestions) {
    const s = document.createElement('div');
    const address = document.createElement('div');
    const nearest = document.createElement('div');
    const hr = document.createElement('hr');
    address.innerHTML = suggestion.words;
    nearest.innerHTML = `<small>${suggestion.nearestPlace}</small>`;
    s.append(address, nearest, hr);

    // Add an event listener when the suggestion is selected
    s.addEventListener('click', async () => {
      await selectedSuggestion(suggestion);
    });

    // Append elements to DOM
    div.append(s);
  }
  if (parent) parent.append(div);
}

/**
 * Use an IIFE to load the app
 */
(function init() {
  if (!W3W_API_KEY) throw new Error('Invalid or missing what3words API key.');

  input = document.querySelector(INPUT_SELECTOR);
  component = document.querySelector(COMPONENT_SELECTOR);

  /**
   * what3words is now available!
   */
  window.what3words = what3words(
    W3W_API_KEY,
    { apiVersion: ApiVersion.Version3, host: W3W_API_ENDPOINT },
    { transport: axiosTransport() }
  );
  let timeout = null;

  // Alternatively, you can set the API key like this:
  // window.what3words.setApiKey(W3W_API_KEY);

  // Attach event listeners to target input element
  input.addEventListener('focus', ({ target }) => {
    const { value } = target;
    if (!value) {
      target.value = '///';
      const cursorPosition = target.value.length;
      setTimeout(
        () => target.setSelectionRange(cursorPosition, cursorPosition),
        10
      );
    }
  });
  input.addEventListener('input', ({ target }) => {
    const { value } = target;
    // Check if the search string is a 3wa-like string - if not do nothing.
    if (!W3W_REGEX.test(value)) return;
    if (timeout) clearTimeout(timeout);

    // Throttle the requests by having a timeout on last input before requesting suggestions
    timeout = setTimeout(async () => {
      const suggestions = await getSuggestions(value);
      displaySuggestions(suggestions);
    }, 300);
  });
  input.addEventListener('blur', event => {
    const {
      target: { value },
    } = event;
    event.stopPropagation();
    setTimeout(() => {
      if (!W3W_REGEX.test(value)) {
        input.value = '';
      }
      clearSuggestions();
    }, 300);
  });
})();
