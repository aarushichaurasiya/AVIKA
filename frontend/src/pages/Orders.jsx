import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fmt } from '../utils/format';

const FLOW = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const LABEL = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await orderService.mine();
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setOrders(res.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loading label="Loading your orders…" />;

  return (
    <div className="wrap" style={{ padding: '40px 20px 80px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Your orders</h1>
      <ErrorMessage message={error} />
      {!error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-soft)' }}>
          No orders yet. <Link to="/" style={{ color: 'var(--maroon)', fontWeight: 600 }}>Browse kitchens →</Link>
        </div>
      )}
      {orders.map((o) => {
        const doneIdx = FLOW.indexOf(o.status);
        return (
          <div key={o._id} className="card" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: 15 }}>{o.kitchen?.name || 'Order'}</h3>
              <span className={`status-pill st-${o.status}`}>{LABEL[o.status]}</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 12 }}>
              {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')} · {fmt(o.total)} · {new Date(o.createdAt).toLocaleString()}
            </p>
            {o.status !== 'cancelled' && (
              <div style={{ display: 'flex', gap: 4 }}>
                {FLOW.map((s, i) => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= doneIdx ? 'var(--maroon)' : 'var(--line)' }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
