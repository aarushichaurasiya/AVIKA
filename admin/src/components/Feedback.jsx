export function Loading({ label = 'Loading…' }) {
  return <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>{label}</div>;
}

export function ErrorMessage({ message, kind = 'error' }) {
  if (!message) return null;
  return <div className={`banner banner-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{message}</div>;
}
