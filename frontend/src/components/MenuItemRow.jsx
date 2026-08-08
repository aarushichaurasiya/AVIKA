import { useCart } from '../context/CartContext';

export default function MenuItemRow({ item }) {
  const { items, changeQty } = useCart();
  const qty = items[item._id] || 0;

  return (
    <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, marginBottom: 10 }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: item.isSpecial ? 'rgba(196,144,62,0.15)' : 'rgba(124,27,59,0.1)', flex: '0 0 auto' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600 }}>
          {item.name}{' '}
          {item.isSpecial && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C4903E', background: 'rgba(196,144,62,0.15)', padding: '2px 7px', borderRadius: 100 }}>
              ★ Today's special
            </span>
          )}
        </h4>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 8px' }}>{item.description}</p>
        <div style={{ fontWeight: 600, fontSize: 14 }}>₹{item.price}</div>
      </div>
      {qty === 0 ? (
        <button className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => changeQty(item._id, 1)}>
          Add
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button aria-label={`Remove one ${item.name}`} onClick={() => changeQty(item._id, -1)} style={qtyBtnStyle}>–</button>
          <span aria-live="polite" style={{ minWidth: 16, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
          <button aria-label={`Add one more ${item.name}`} onClick={() => changeQty(item._id, 1)} style={qtyBtnStyle}>+</button>
        </div>
      )}
    </div>
  );
}

const qtyBtnStyle = {
  width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--line)', background: '#fff',
  cursor: 'pointer', fontWeight: 600, color: 'var(--maroon)'
};
