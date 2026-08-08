import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Page not found</h1>
      <Link to="/" style={{ color: 'var(--maroon)', fontWeight: 600 }}>← Back to Avika</Link>
    </div>
  );
}
