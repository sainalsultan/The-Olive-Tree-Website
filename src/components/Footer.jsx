import LeafIcon from './LeafIcon';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LeafIcon size={24} />
          Le Petit Bistrot
        </div>
        <p>24 Rue des Martyrs, 75009 Paris, France &nbsp;·&nbsp; +33 1 42 00 00 00</p>
        <p className="footer-copy">© 2026 Le Petit Bistrot. All rights reserved.</p>
      </div>
    </footer>
  );
}
