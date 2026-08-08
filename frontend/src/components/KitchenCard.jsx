import { useNavigate } from 'react-router-dom';

export default function KitchenCard({ kitchen }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      role="link"
      tabIndex={0}
      style={{ overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => navigate(`/kitchens/${kitchen._id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/kitchens/${kitchen._id}`); }}
    >
      <div style={{ height: 140, background: 'linear-gradient(160deg, #EADCC6, #DFC9A6)' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ fontSize: 15 }}>{kitchen.name}</h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-dark)' }}>★ {kitchen.rating || '—'}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>{(kitchen.cuisine || []).join(', ')}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <span>{kitchen.isOpen ? 'Open now' : 'Closed'}</span>
          <span>₹{kitchen.deliveryFee ?? 0} delivery</span>
        </div>
      </div>
    </div>
  );
}
