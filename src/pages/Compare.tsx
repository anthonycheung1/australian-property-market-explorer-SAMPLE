import { useState } from 'react';
import { getSuburbMarketData } from '../api/propertyApi';
import ComparisonTable from '../components/ComparisonTable';
import SearchBar from '../components/SearchBar';
import type { PropertyType, SuburbMarketData, SuburbSuggestion } from '../types/property';

export default function Compare() {
  const [selected, setSelected] = useState<SuburbSuggestion[]>([]);
  const [results, setResults] = useState<SuburbMarketData[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addSuburb(suburb: SuburbSuggestion) {
    setSelected((current) => {
      const exists = current.some(
        (item) => item.state === suburb.state && item.postcode === suburb.postcode && item.name === suburb.name
      );
      if (exists || current.length >= 3) return current;
      return [...current, suburb];
    });
  }

  function removeSuburb(id: string) {
    setSelected((current) => current.filter((item) => item.id !== id));
    setResults((current) => current.filter((item) => item.postcode !== id));
  }

  async function compareSuburbs() {
    setLoading(true);
    setError('');

    try {
      const data = await Promise.all(
        selected.map((item) =>
          getSuburbMarketData(item.name, item.state, item.postcode, propertyType)
        )
      );
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compare these suburbs.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <p className="eyebrow">SIDE-BY-SIDE ANALYSIS</p>
      <h1>Compare suburbs</h1>
      <p className="page-description">Choose up to three suburbs and compare the available market metrics.</p>

      <SearchBar onSelect={addSuburb} label="Add a suburb to compare" />

      <div className="comparison-controls">
        <div className="select-field">
          <label htmlFor="compare-property-type">Property type</label>
          <select
            id="compare-property-type"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value as PropertyType)}
          >
            <option value="House">House</option>
            <option value="Unit">Unit</option>
            <option value="All">All</option>
          </select>
        </div>
        <button type="button" onClick={() => void compareSuburbs()} disabled={selected.length === 0 || loading}>
          {loading ? 'Comparing…' : 'Compare selected suburbs'}
        </button>
      </div>

      <ul className="selected-suburbs">
        {selected.map((item) => (
          <li key={item.id}>
            <span>{item.displayName}</span>
            <button type="button" className="text-button" onClick={() => removeSuburb(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="error-text" role="alert">{error}</p>}
      <ComparisonTable suburbs={results} />
    </div>
  );
}