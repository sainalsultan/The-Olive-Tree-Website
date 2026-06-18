import LeafIcon from './LeafIcon';

export default function Hero({ onReserve }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-gradient" />
      <div className="hero-content">
        <div className="badge">Paris · Traditional French</div>
        <div className="logo-leaf" aria-hidden="true">
          <LeafIcon size={52} opacity={0.9} />
        </div>
        <h1>Le Petit Bistrot</h1>
        <p className="tagline">Traditional French cuisine in the heart of Paris</p>
        <p className="hero-sub">Seasonal ingredients. Warm atmosphere. A table worth remembering.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onReserve}>Reserve a Table</button>
          <a href="#menu" className="btn-ghost-light">View Menu</a>
        </div>
      </div>
      <div className="hero-scroll-hint" aria-hidden="true">
        <span>Scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
