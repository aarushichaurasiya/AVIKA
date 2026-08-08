import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/Feedback';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = mode === 'login' ? await login(email.trim(), password) : await register(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (!res.ok) return setError(res.error);
    if (mode === 'signup') {
      // Kitchen setup lives in the separate customer app (frontend/), not here —
      // cross-app navigation needs a full URL since these are different Vite dev servers.
      window.location.href = (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173') + '/kitchen-setup';
      return;
    }
    navigate('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--cream)', width: 380, maxWidth: '92vw', padding: '40px 34px', borderRadius: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <svg width={24} height={24} viewBox="0 0 48 48"><path d="M24 4 L42 40 L6 40 Z" fill="#7C1B3B" /><circle cx="24" cy="20" r="6" fill="#FBF6EC" /></svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--maroon)' }}>AVIKA admin</span>
        </div>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>{mode === 'login' ? 'Cook / admin sign in' : 'Create your kitchen account'}</h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>
          {mode === 'login' ? "Manage your kitchen's orders and menu." : 'Register as a cook, then set up your kitchen.'}
        </p>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarushichaurasiya@gmail.com" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" style={{ width: '100%', padding: 13 }} disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 16, textAlign: 'center' }}>Seeded test cook: aarushichaurasiya@gmail.com / password123</p>
        <p style={{ fontSize: 12, textAlign: 'center', marginTop: 6 }}>
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--maroon)', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'login' ? 'New kitchen? Create a cook account' : 'Already have an account? Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
