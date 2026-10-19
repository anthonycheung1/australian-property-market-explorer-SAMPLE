export default function About() {
  return (
    <div className="page narrow-page">
      <p className="eyebrow">ABOUT THIS PROJECT</p>
      <h1>Australian Property Market Explorer</h1>
      <p>
        This portfolio project explores suburb-level Australian property-market data through
        search, summary statistics, historical charts and suburb comparisons.
      </p>
      <h2>Data and limitations</h2>
      <p>
        Market metrics depend on the API provider, the selected property type and the available
        observation period. Missing values are shown as unavailable rather than invented.
        This project is for learning and informational purposes, not financial advice.
      </p>
      <p>
        Data is available only for the following suburbs via <a href="https://www.microburbs.com.au/developers/api-docs">Microburbs</a> for free:
        <ul>
          <li>Bondi (NSW)</li>
          <li>Belmont North (NSW)</li>
          <li>St Kilda (VIC)</li>
          <li>Fortitude Valley (QLD)</li>
          <li>Subiaco (WA)</li>
          <li>Unley (SA)</li>
          <li>Sandy Bay (TAS)</li>
          <li>Kambah (ACT)</li>
          <li>Nightcliff (NT)</li>
        </ul>
      </p>
      <h2>Technology</h2>
      <p>React, TypeScript, Vite, React Router and Recharts.</p>
    </div>
  );
}