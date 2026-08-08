export default function Loading({ label = 'Loading…' }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>
      {label}
    </div>
  );
}
