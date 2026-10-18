import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to="/" aria-label="Property Explorer home">
          Property Explorer
        </NavLink>

        <nav aria-label="Main navigation" className="main-nav">
          <NavLink to="/" end>
            Explore
          </NavLink>
          <NavLink to="/compare">
            Compare
          </NavLink>
          <NavLink to="/about">
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}