import { useMemo } from 'react';

function generateRef() {
  return 'OT-' + Math.floor(1000 + Math.random() * 9000);
}

export default function BookingView({ booking, onDone, onModify }) {
  const ref = useMemo(() => (booking ? generateRef() : ''), [booking]);

  if (!booking) return null;

  const rows = [
    { icon: '👤', label: 'Name',  value: booking.name || 'Guest' },
    { icon: '📅', label: 'Date',  value: booking.date },
    { icon: '🕐', label: 'Time',  value: booking.time },
    { icon: '👥', label: 'Guests', value: `${booking.guests} ${booking.guests === 1 ? 'person' : 'people'}` },
    { icon: '📍', label: 'Venue', value: '12 Rue de la Paix, Paris' },
    ...(booking.occasion && booking.occasion !== 'none'
      ? [{ icon: '🎉', label: 'Occasion', value: booking.occasion }]
      : []),
  ];

  return (
    <div className="booking-view open">
      <div className="booking-card booking-card-responsive">
        <div className="booking-left">
          <div className="booking-checkmark">
            <svg viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="25" stroke="#8aaa6b" strokeWidth="2" />
              <path
                className="check-path"
                d="M14 26 L22 34 L38 18"
                stroke="#8aaa6b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
  
          <h2>Reservation Confirmed</h2>
  
          <p className="booking-subtitle">
            Your table at Le Petit Bistrot is reserved
          </p>
  
          <div className="booking-ref-badge">
            {ref}
          </div>
        </div>
  
        <div className="booking-right">
          <div className="booking-details">
            {rows.map(({ icon, label, value }) => (
              <div className="booking-detail-row" key={label}>
                <span className="icon">{icon}</span>
                <span className="label">{label}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
  
          <div className="booking-note">
            We look forward to welcoming you! For groups of 6+, please call us
            directly on +33 1 42 00 00 00. Free cancellation up to 24h before
            your reservation.
          </div>
  
          <div className="booking-actions">
            <button
              className="btn-primary"
              onClick={onDone}
            >
              Perfect, thank you!
            </button>
  
            <button
              className="btn-ghost"
              onClick={onModify}
            >
              Modify Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
