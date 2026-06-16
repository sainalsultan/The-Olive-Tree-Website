import { HOURS } from '../constants/restaurant';

export default function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">

        {/* ── Top label strip ── */}
        <div className="about-eyebrow">
          <span className="about-eyebrow-line" />
          <span className="section-label">Find Us</span>
        </div>

        <div className="ct-grid">

          {/* ── LEFT: heading + hours + contact info ── */}
          <div className="ct-left">
            <h2 className="ct-h2">
              Hours &amp; <em>Contact</em>
            </h2>

            <p className="ct-hours-label">Opening Hours</p>
            <div className="ct-hours-list">
              {HOURS.map(({ day, slots, closed }) => (
                <div className={`ct-hour-row${closed ? ' closed' : ''}`} key={day}>
                  <div className={`ct-hour-top${!closed && slots.length ? ' has-slots' : ''}`}>
                    <div className="ct-hour-left">
                      <span className={`ct-hour-dot${closed ? ' closed' : ''}`} />
                      <span className={`ct-hour-day${closed ? ' closed' : ''}`}>{day}</span>
                    </div>
                    {closed && <span className="ct-closed-tag">Closed</span>}
                  </div>
                
                  {!closed && (
                    <div className="ct-hour-slots">
                      {slots.map(({ label, time }) => (
                        <div className="ct-hour-slot" key={label}>
                          <span className="ct-slot-label">{label}</span>
                          <span className="ct-hour-time">{time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="ct-info">
              <div className="ct-info-row">
                <div className="ct-info-icon">📍</div>
                <div className="ct-info-body">
                  <strong>12 Rue de la Paix, 75002 Paris</strong>
                  <small>Nearest parking: Parking Vendôme, 2 min walk</small>
                </div>
              </div>
              <div className="ct-info-row">
                <div className="ct-info-icon">📞</div>
                <div className="ct-info-body">
                  <a href="tel:+33142000000">+33 1 42 00 00 00</a>
                </div>
              </div>
              <div className="ct-info-row">
                <div className="ct-info-icon">✉️</div>
                <div className="ct-info-body">
                  <a href="mailto:hello@theolivetree-paris.com">
                    hello@theolivetree-paris.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: map + info mini cards ── */}
          <div className="ct-right">
            <div className="map-placeholder ct-map">
              <div className="ct-map-grid" aria-hidden="true">
                <div className="ct-map-road-h" style={{ top: '42%' }} />
                <div className="ct-map-road-h" style={{ top: '65%' }} />
                <div className="ct-map-road-v" style={{ left: '30%' }} />
                <div className="ct-map-road-v" style={{ left: '68%' }} />
              </div>
              <div className="map-inner ct-map-inner">
                <div className="ct-map-pin-wrap">
                  <span className="map-pin">📍</span>
                </div>
                <strong>The Olive Tree</strong>
                <small>12 Rue de la Paix, Paris</small>
                <a
                  href="https://maps.google.com/?q=12+Rue+de+la+Paix+Paris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            <div className="ct-mini-cards">
              <div className="ct-mini-card">
                <p className="ct-mini-label">Metro</p>
                <strong className="ct-mini-val">Opéra</strong>
                <p className="ct-mini-sub">Lines 3, 7, 8 · 3 min walk</p>
              </div>
              <div className="ct-mini-card">
                <p className="ct-mini-label">Reservations</p>
                <strong className="ct-mini-val">Required</strong>
                <p className="ct-mini-sub">Book 24 hrs in advance</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}