import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AutosuggestClient,
  AutosuggestInputType,
  type AutosuggestOptions,
  type AutosuggestSuggestion,
} from '@what3words/api';
import { useState } from 'react';

const API_KEY = '<YOUR_API_KEY>';
const DEBOUNCE_TIME = 300;

const client: AutosuggestClient = AutosuggestClient.init(API_KEY);

const white = '#ffffff';
const blue = '#0a3049';
const red = '#e11f26';
const lightGrey = '#e0e0e0';
const lightBlue = '#dbeffa';

let timeoutId: NodeJS.Timeout | null = null;

export default function App() {
  const [search, setSearch] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AutosuggestSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch suggestions from the API when the search input value changes
   * @param {string} search The search input value
   * @returns {Promise<void>}
   */
  async function handleOnSearch(search: string): Promise<void> {
    setSearch(search);

    // Cancel previous request before sending a new one
    if (timeoutId) clearTimeout(timeoutId);

    // Don't search if the input is empty
    if (!search) return setSuggestions([]);

    // Debounce the request to avoid sending too many requests while the user is typing
    timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const options: AutosuggestOptions = {
          input: search,
          inputType: AutosuggestInputType.Text,
          nResults: 3,
          // Uncomment the following options to restrict the search
          // focus: { lat: 51.521251, lng: -0.203586 },
          // clipToCountry: ['GB'],
          // clipToCircle: { center: { lat: 51.521, lng: -0.343 }, radius: 142 },
          // clipToBoundingBox: {
          //   southwest: { lat: 51.521, lng: -0.343 },
          //   northeast: { lat: 52.6, lng: 2.3324 },
          // },
          // clipToPolygon: [
          //   { lat: 51.521, lng: -0.343 },
          //   { lat: 52.6, lng: 2.3324 },
          //   { lat: 54.234, lng: 8.343 },
          //   { lat: 51.521, lng: -0.343 },
          // ],
          // language: 'en',
          // preferLand: true,
        };

        const { suggestions } = await client.run(options);

        if (!suggestions.length) {
          throw new Error('No valid 3 word address found.');
        }

        setSuggestions(suggestions);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_TIME);
  }

  /**
   * Set the selected suggestion words as the search input value and clear the suggestions list
   * @param {AutosuggestSuggestion} sug The selected suggestion
   */
  function handleSuggestionPress(sug: { item: AutosuggestSuggestion }): void {
    setSearch(sug.item.words);
    setSuggestions([]);
  }

  /**
   * Render a suggestion as a Pressable RN component
   * @param {AutosuggestSuggestion} sug The suggestion to render
   * @returns {JSX.Element}
   */
  const renderItem = (sug: { item: AutosuggestSuggestion }): JSX.Element => (
    <Pressable
      onPress={() => handleSuggestionPress(sug)}
      style={({ pressed }) => [
        styles.suggestion,
        pressed ? { backgroundColor: lightBlue } : {},
      ]}>
      <Text style={styles.suggestionWords}>
        <Text style={styles.suggestionTripleSlash}>///</Text>
        {sug.item.words}
      </Text>
      <Text style={styles.suggestionNearestPlace}>
        {sug.item.nearestPlace}, {sug.item.country}
      </Text>
    </Pressable>
  );

  const showErrorMessage = !isLoading && !suggestions.length && error;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="/// filled.count.soap"
          onChangeText={handleOnSearch}
          value={search}
          cursorColor={blue}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          autoFocus={true}
        />
        {showErrorMessage && (
          <Text style={styles.errorMessage}>{error.message}</Text>
        )}
      </View>

      <FlatList
        style={styles.suggestions}
        data={suggestions}
        keyExtractor={sug => sug.words}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: 48,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    height: 48,
    width: '100%',
    color: blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 20,
    borderWidth: 1,
    borderColor: lightGrey,
  },
  suggestions: {
    flex: 1,
    width: '100%',
    backgroundColor: white,
  },
  suggestion: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: white,
    borderWidth: 1,
    borderTopColor: 'transparent',
    borderColor: lightGrey,
  },
  suggestionTripleSlash: {
    color: red,
  },
  suggestionWords: {
    fontSize: 20,
    fontWeight: 'bold',
    color: blue,
    marginBottom: 4,
  },
  suggestionNearestPlace: {
    fontSize: 16,
    color: blue,
  },
  errorMessage: {
    color: red,
    paddingVertical: 4,
  },
});
