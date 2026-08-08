import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (isRegister && !name.trim()) return setError('Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    const res = isRegister ? await register(name.trim(), email.trim(), password) : await login(email.trim(), password);
    setSubmitting(false);

    if (!res.ok) return setError(res.error);
    navigate(params.get('redirect') || '/');
  }

  return (
    <div className="wrap" style={{ maxWidth: 420, padding: '60px 20px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 24 }}>
        {isRegister ? 'Join Avika to order from home kitchens near you.' : 'Log in to continue ordering from your favorite kitchens.'}
      </p>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={submitting}>
          {submitting ? (isRegister ? 'Creating account…' : 'Logging in…') : (isRegister ? 'Create account' : 'Log in')}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 22 }}>
        {isRegister ? (
          <>Already have an account? <Link to="/login" style={{ color: 'var(--maroon)', fontWeight: 600 }}>Log in</Link></>
        ) : (
          <>New to Avika? <Link to="/register" style={{ color: 'var(--maroon)', fontWeight: 600 }}>Create an account</Link></>
        )}
      </p>
    </div>
  );
}
