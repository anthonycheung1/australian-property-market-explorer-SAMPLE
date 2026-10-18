
import { useEffect, useState } from 'react';
import { searchSuburbs } from '../api/propertyApi';
import type { SuburbSuggestion } from '../types/property';

type SearchBarProps = {
  onSelect: (suburb: SuburbSuggestion) => void;
  label?: string;
};

export default function SearchBar({
  onSelect,
  label = 'Search for an Australian suburb',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuburbSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!canSearch) return;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const results = await searchSuburbs(
          trimmedQuery,
          controller.signal,
        );

        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to search right now.',
        );
        setSuggestions([]);
        setIsOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [canSearch, trimmedQuery]);

  function handleQueryChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError('');
      setIsOpen(false);
    }
  }

  function handleSelect(suggestion: SuburbSuggestion) {
    setQuery(suggestion.displayName);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(suggestion);
  }

  return (
    <div className="search-field">
      <label htmlFor="suburb-search">{label}</label>
      <input
        id="suburb-search"
        type="search"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => {
          if (canSearch && (suggestions.length > 0 || error)) {
            setIsOpen(true);
          }
        }}
        placeholder="e.g. Zetland"
        autoComplete="off"
        aria-controls="suburb-suggestions"
        aria-expanded={isOpen && canSearch}
      />

      {loading && canSearch && (
        <p className="field-message" role="status">
          Searching…
        </p>
      )}

      {error && canSearch && (
        <p className="field-message error-text" role="alert">
          {error}
        </p>
      )}

      {isOpen && canSearch && !loading && !error && (
        <ul id="suburb-suggestions" className="suggestion-list">
          {suggestions.length === 0 ? (
            <li className="suggestion-empty">
              No matching suburbs found.
            </li>
          ) : (
            suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="suggestion-option"
                  onClick={() => handleSelect(suggestion)}
                >
                  {suggestion.displayName}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
