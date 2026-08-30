import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Activity size={20} />
          </div>
          <div>
            <div className="brand-name">ASCLEPIUS</div>
            <div className="brand-subtitle">BIOMEDICAL INTELLIGENCE</div>
          </div>
        </Link>

        <nav className="desktop-nav">
          <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">
            Home
          </Link>
          <Link className={`nav-link ${isActive('/search') ? 'active' : ''}`} to="/search">
            Search
          </Link>
          <Link className={`nav-link ${isActive('/analytics') ? 'active' : ''}`} to="/analytics">
            Analytics
          </Link>
          <Link className={`nav-link ${isActive('/references') ? 'active' : ''}`} to="/references">
            References
          </Link>
        </nav>

        <SearchBar />
      </div>
    </header>
  );
}
