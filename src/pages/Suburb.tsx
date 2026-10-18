import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSuburbMarketData } from '../api/propertyApi';
import PriceChart from '../components/PriceChart';
import RentChart from '../components/RentChart';
import SuburbOverview from '../components/SuburbOverview';
import type { PropertyType, SuburbMarketData } from '../types/property';

export default function Suburb() {
  const { state = '', suburb = '', postcode = '' } = useParams();
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [data, setData] = useState<SuburbMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError('');

      try {
        const result = await getSuburbMarketData(
          decodeURIComponent(suburb),
          state.toUpperCase(),
          postcode,
          propertyType,
          controller.signal
        );
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unable to load suburb data.');
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [state, suburb, postcode, propertyType]);

  return (
    <div className="page">
      <p><Link to="/">← Back to Explore</Link></p>

      <div className="page-heading">
        <div>
          <p className="eyebrow">PROPERTY MARKET</p>
          <h1>Suburb details</h1>
        </div>
        <div className="select-field">
          <label htmlFor="property-type">Property type</label>
          <select
            id="property-type"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value as PropertyType)}
          >
            <option value="House">House</option>
            <option value="Unit">Unit</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      {loading && <p role="status" className="status-panel">Loading suburb data…</p>}
      {error && (
        <div className="status-panel error-panel" role="alert">
          <p>{error}</p>
          <p>Check your API configuration and confirm that the adapter matches the current response schema.</p>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <SuburbOverview data={data} />
          <div className="chart-grid">
            <PriceChart data={data.history} />
            <RentChart data={data.history} />
          </div>
        </>
      )}
    </div>
  );
}