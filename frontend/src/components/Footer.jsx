import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--maroon-dark)', color: '#F3DFE4', padding: '40px 0 26px', marginTop: 60 }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>AVIKA</span>
        <span style={{ fontSize: 13, color: '#DDB9C3' }}>From local kitchens, with love.</span>
        <Link to="/kitchen-setup" style={{ fontSize: 13, color: '#F3DFE4', fontWeight: 600 }}>Sell your food on Avika →</Link>
      </div>
    </footer>
  );
}
