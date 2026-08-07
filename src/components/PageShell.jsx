import { useState } from 'react'
import './PageShell.css'

function PageShell({ activePage, onNavigate, title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'past', label: 'Past Polls' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
    { id: 'admin', label: 'Admin' },
  ]

  return (
    <main className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <span className="brand-flag">
              <span className="flag-dot flag-red" />
              <span className="flag-dot flag-gold" />
              <span className="flag-dot flag-green" />
            </span>
            <div className="brand-text">
              <span className="brand-title">
                Ghana<span className="brand-accent">Speaks</span>
              </span>
              <span className="brand-sub">Your Opinion. Our Nation.</span>
            </div>
          </div>

          <nav className="nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="navbar-actions">
            <button className="icon-btn" aria-label="Toggle theme">☀️</button>
            <button className="share-btn" type="button">
              <span>↗</span> Share Poll
            </button>
            <button
              className={`hamburger-btn ${menuOpen ? 'hamburger-open' : ''}`}
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.id)
                setMenuOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="page-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      {children}

      <footer className="footer">
        <div className="footer-inner">
          <div className="brand">
            <span className="brand-flag">
              <span className="flag-dot flag-red" />
              <span className="flag-dot flag-gold" />
              <span className="flag-dot flag-green" />
            </span>
            <div className="brand-text">
              <span className="brand-title footer-title">
                Ghana<span className="brand-accent">Speaks</span>
              </span>
              <span className="brand-sub footer-sub">Your Opinion. Our Nation.</span>
            </div>
          </div>
          <div className="footer-copy">© 2025 GhanaSpeaks. All rights reserved.</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <span>|</span>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default PageShell
