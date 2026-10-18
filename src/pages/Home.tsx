import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import type { SuburbSuggestion } from '../types/property';

export default function Home() {
  const navigate = useNavigate();

  function handleSelect(suburb: SuburbSuggestion) {
    navigate(
      `/suburb/${encodeURIComponent(suburb.state.toLowerCase())}/${encodeURIComponent(suburb.name.toLowerCase())}`
    );
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">AUSTRALIAN PROPERTY DATA</p>
        <h1>Explore the property market, one suburb at a time.</h1>
        <p className="hero-description">
          Explore suburb-level prices, rents, historical trends and market metrics.
        </p>
        <SearchBar onSelect={handleSelect} />
      </section>

      <section className="intro-grid">
        <article className="panel">
          <h2>Explore</h2>
          <p>Search for a suburb and review the market metrics available from the data provider.</p>
        </article>
        <article className="panel">
          <h2>Compare</h2>
          <p>Compare selected suburbs side by side using consistent metrics.</p>
        </article>
        <article className="panel">
          <h2>Understand trends</h2>
          <p>Use historical charts to explore price and rental trends where data is available.</p>
        </article>
      </section>
    </div>
  );
}