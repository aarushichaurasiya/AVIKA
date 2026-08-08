export default function ErrorMessage({ message, kind = 'error' }) {
  if (!message) return null;
  return (
    <div className={`banner banner-${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live="polite">
      {message}
    </div>
  );
}
