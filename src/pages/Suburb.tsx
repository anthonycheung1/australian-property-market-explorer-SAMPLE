import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PriceChart from '../components/PriceChart';
import RentChart from '../components/RentChart';
import SuburbOverview from '../components/SuburbOverview';
import { getSuburbMarketData } from '../api/propertyApi';

import type {
  PropertyType,
  SuburbMarketData,
} from '../types/property';

export default function Suburb() {
  // These names must match App.tsx:
  // /suburb/:state/:suburb
  const { state, suburb } = useParams<{
    state: string;
    suburb: string;
  }>();

  const [propertyType, setPropertyType] =
    useState<PropertyType>('All');

  const [data, setData] = useState<SuburbMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSuburb() {
      if (!suburb) {
        setError('No suburb was specified.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setData(null);

      try {
        // Pass the suburb and state separately.
        const result = await getSuburbMarketData(
          decodeURIComponent(suburb),
          state?.toUpperCase(),
        );

        if (!cancelled) {
          setData(result);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load the suburb market data.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSuburb();

    return () => {
      cancelled = true;
    };
  }, [suburb, state]);

  if (loading) {
    return (
      <main className="page-container">
        <p role="status">Loading suburb market data…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-container">
        <Link to="/">← Back to Explore</Link>
        <h1>Unable to load suburb data</h1>
        <p role="alert">
          {error ?? 'No market data was returned.'}
        </p>
        <p>
          Check the suburb name and try again. Some Microburbs API
          endpoints may not have data available for every suburb.
        </p>
      </main>
    );
  }

  return (
    <main className="page-container suburb-page">
      <nav aria-label="Breadcrumb">
        <Link to="/">Explore suburbs</Link>
        <span aria-hidden="true"> / </span>
        <span>{data.suburb}</span>
      </nav>

      <header className="suburb-header">
        <div>
          <h1>{data.suburb}</h1>
          <p>
            {[data.state, data.postcode]
              .filter(Boolean)
              .join(' ')}
          </p>
        </div>

        <label className="property-type-control">
          <span>Property type</span>
          <select
            value={propertyType}
            onChange={(event) =>
              setPropertyType(event.target.value as PropertyType)
            }
          >
            <option value="All">All property types</option>
            <option value="House">House</option>
            <option value="Unit">Unit</option>
          </select>
        </label>
      </header>

      <SuburbOverview
        data={data}
        propertyType={propertyType}
      />

      <div className="chart-grid">
        <PriceChart
          data={data.history}
          propertyType={propertyType}
        />

        <RentChart
          data={data.history}
          propertyType={propertyType}
        />
      </div>
    </main>
  );
}