import { useEffect, useState, useCallback } from 'react';
import LeafIcon from './LeafIcon';

const NAV_LINKS = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#menu',  label: 'Menu' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ onReserve }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll saat drawer buka
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleNavLink = (e, href) => {
    e.preventDefault();
    closeDrawer();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  const handleReserve = () => {
    closeDrawer();
    setTimeout(onReserve, 250);
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo" onClick={(e) => handleNavLink(e, '#hero')}>
            <span className="nav-leaf"><LeafIcon size={24} /></span>
            Le Petit Bistrot
          </a>

          {/* Desktop links */}
          <div className="nav-links">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </div>
          <button className="nav-cta" onClick={onReserve}>Reserve a Table</button>

          {/* Hamburger (mobile) */}
          <button
            className={`nav-hamburger${drawerOpen ? ' open' : ''}`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer${drawerOpen ? ' open' : ''}`} onClick={closeDrawer}>
        {NAV_LINKS.map(({ href, label }) => (
          <a key={href} href={href} onClick={(e) => handleNavLink(e, href)}>
            {label}
          </a>
        ))}
        <button className="btn-primary" onClick={handleReserve} style={{ marginTop: '0.5rem' }}>
          Reserve a Table
        </button>
      </div>
    </>
  );
}
