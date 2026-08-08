import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,246,236,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--line)' }}>
      <nav className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={28} height={28} viewBox="0 0 48 48">
            <path d="M24 4 L42 40 L6 40 Z" fill="#7C1B3B" />
            <circle cx="24" cy="20" r="6" fill="#FBF6EC" />
            <path d="M24 26 C24 26 16 30 16 36" stroke="#FBF6EC" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--maroon)' }}>AVIKA</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/orders" className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: 14 }}>My orders</Link>
          <Link to="/cart" className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: 14 }}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
          {isLoggedIn ? (
            <button className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: 14 }} onClick={logout}>Log out</button>
          ) : (
            <Link to="/login" className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: 14 }}>Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
