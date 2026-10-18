import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import About from './pages/About';
import Compare from './pages/Compare';
import Home from './pages/Home';
import Suburb from './pages/Suburb';

export default function App() {
  return (
    <BrowserRouter basename="/australian-property-market-explorer-SAMPLE">
      <div className="app-shell">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/suburb/:state/:suburb/:postcode" element={<Suburb />} />
            <Route path="*" element={
              <div className="page">
                <h1>Page not found</h1>
                <p>The page you requested does not exist.</p>
              </div>
            } />
          </Routes>
        </main>
        <footer className="site-footer">
          <p>Australian Property Market Explorer · Portfolio project</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}