import LeafIcon from './LeafIcon';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LeafIcon size={24} />
          The Olive Tree
        </div>
        <p>12 Rue de la Paix, 75002 Paris &nbsp;·&nbsp; +33 1 42 00 00 00</p>
        <p className="footer-copy">© 2026 The Olive Tree Paris. All rights reserved.</p>
      </div>
    </footer>
  );
}
