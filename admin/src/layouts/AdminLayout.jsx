import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z' },
  { to: '/orders', label: 'Orders', icon: 'M4 4h16v4a4 4 0 0 1-4 4h-2v8h-4v-8H8a4 4 0 0 1-4-4V4z' },
  { to: '/menu', label: 'Menu', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: '/team', label: 'Team', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: 'var(--sidebar)', color: 'var(--sidebar-text)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 26px' }}>
          <svg width={24} height={24} viewBox="0 0 48 48"><path d="M24 4 L42 40 L6 40 Z" fill="#F3DFE4" /><circle cx="24" cy="20" r="6" fill="#2A1019" /></svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff' }}>AVIKA <span style={{ fontSize: 10.5, color: '#9A7480', fontWeight: 500 }}>admin</span></span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
                fontSize: 14, fontWeight: 500, color: isActive ? '#fff' : 'var(--sidebar-text)',
                background: isActive ? 'var(--maroon)' : 'transparent'
              })}
            >
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={item.icon} /></svg>
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/approvals" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: isActive ? '#fff' : 'var(--sidebar-text)',
              background: isActive ? 'var(--maroon)' : 'transparent'
            })}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              Approvals
            </NavLink>
          )}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: 'var(--maroon-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: '#9A7480', fontSize: 11.5, cursor: 'pointer', padding: 0 }}>Log out</button>
            </div>
          </div>
        </div>
      </aside>
      <main style={{ padding: '32px 36px 60px' }}>
        <Outlet />
      </main>
    </div>
  );
}
