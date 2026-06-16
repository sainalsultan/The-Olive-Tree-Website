import { FEATURES, STATS } from '../constants/restaurant';

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-split">

          {/* ── LEFT: Copy + Features + CTA ── */}
          <div className="about-left">

            <div className="about-eyebrow">
              <span className="about-eyebrow-line" />
              <span className="section-label">About Us</span>
            </div>

            <h2 className="about-h2">
              Where the Mediterranean<br />
              <em>meets Paris</em>
            </h2>

            <p className="about-body">
              Tucked on Rue de la Paix in the 2nd arrondissement, The Olive Tree was born
              from a simple idea — to bring the warmth and freshness of Mediterranean
              cooking to the Parisian table.
            </p>
            <p className="about-body">
              Every dish is made with seasonal ingredients sourced from small producers
              across Greece, Italy, Lebanon and Spain. No shortcuts. Just honest, beautiful food.
            </p>

            <a href="#menu" className="about-cta-btn">
              Explore the Menu
              <span className="about-cta-arrow">→</span>
            </a>
          </div>

          {/* ── RIGHT: Collage + Stats ── */}
          <div className="about-right">

            <div className="about-collage">
              <div className="col-cell col-main">
                <img src="/images/restaurant.jpeg" alt="Our chef at work" className="col-img" />
                <span className="col-caption">Open Kitchen</span>
              </div>
              <div className="col-cell col-tr">
                <img src="/images/restaurant.jpeg" alt="Signature dish" className="col-img" />
                <span className="col-caption">Signature Dishes</span>
              </div>
              <div className="col-cell col-br">
                <img src="/images/restaurant.jpeg" alt="Fresh produce" className="col-img" />
                <span className="col-caption">Fresh Produce</span>
              </div>

              {/* Floating years badge */}
              <div className="col-badge">
                <strong>14+</strong>
                <span>Years<br />Serving</span>
              </div>
            </div>

            <div className="about-stats-row">
              {STATS.map(({ value, label }) => (
                <div className="about-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}