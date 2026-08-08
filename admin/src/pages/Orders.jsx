import { useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { orderService } from '../services/orderService';
import { Loading, ErrorMessage } from '../components/Feedback';

const FLOW = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const LABEL = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Orders() {
  const [kitchenId, setKitchenId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const kRes = await kitchenService.mine();
      if (!kRes.ok) { setError(kRes.error); setLoading(false); return; }
      setKitchenId(kRes.data._id);
      const oRes = await orderService.forKitchen(kRes.data._id);
      if (!oRes.ok) { setError(oRes.error); setLoading(false); return; }
      setOrders(oRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(orderId, status) {
    const res = await orderService.updateStatus(orderId, status);
    if (!res.ok) { alert(res.error); return; }
    setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
  }

  if (loading) return <Loading label="Loading orders…" />;
  if (error) return <ErrorMessage message={error} />;

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Orders</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>Advance an order's status as it moves through your kitchen.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...FLOW, 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '7px 16px', borderRadius: 100, border: '1px solid var(--line)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === s ? 'var(--maroon)' : '#fff', color: filter === s ? '#fff' : 'var(--ink-soft)'
            }}
          >
            {s === 'all' ? 'All' : LABEL[s]}
          </button>
        ))}
      </div>

      {visible.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No orders here.</p>}

      <div className="card" style={{ overflow: 'hidden' }}>
        {visible.map((o) => {
          const nextOptions = o.status === 'delivered' || o.status === 'cancelled' ? [o.status] : FLOW.slice(FLOW.indexOf(o.status));
          return (
            <div key={o._id} style={{ borderTop: '1px solid var(--line)' }}>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr auto', gap: 12, padding: '14px 20px', alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              >
                <span>#{o._id.slice(-6).toUpperCase()}</span>
                <span>{o.customer?.name || 'Customer'}</span>
                <span>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</span>
                <span>₹{o.total}</span>
                <span className={`status-pill st-${o.status}`}>{LABEL[o.status]}</span>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  disabled={o.status === 'delivered' || o.status === 'cancelled'}
                  style={{ fontSize: 12.5, padding: '6px 8px', width: 'auto' }}
                >
                  {nextOptions.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </div>
              {expanded === o._id && (
                <div style={{ background: 'var(--sand)', padding: '12px 20px', fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  Deliver to: {o.deliveryAddress?.line1} · Phone: {o.deliveryAddress?.phone}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
