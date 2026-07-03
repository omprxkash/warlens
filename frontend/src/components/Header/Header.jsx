import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="site-brand" aria-label="WarLens home">
          <span className="site-brand-mark" aria-hidden="true">
            <span className="site-brand-dot" />
          </span>
          <span className="site-brand-word">WarLens</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`}>
            Dataset
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`}>
            Analyze
          </NavLink>
        </nav>

        <div className="site-header-cta">
          <Link to="/upload" className="btn btn-primary">
            Analyze an image
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
