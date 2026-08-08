import { useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { orderService } from '../services/orderService';
import { Loading, ErrorMessage } from '../components/Feedback';

export default function Dashboard() {
  const [kitchen, setKitchen] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const kRes = await kitchenService.mine();
      if (!kRes.ok) { setError(kRes.error); setLoading(false); return; }
      setKitchen(kRes.data);
      const oRes = await orderService.forKitchen(kRes.data._id);
      if (oRes.ok) setOrders(oRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loading label="Loading your kitchen…" />;
  if (error) {
    return (
      <div>
        <ErrorMessage message={error} />
        {error.includes('not set up') && <a href="http://localhost:5173/kitchen-setup" className="btn">Set up your kitchen</a>}
      </div>
    );
  }

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const revenueToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const dishCounts = {};
  orders.forEach((o) => o.items.forEach((i) => { dishCounts[i.name] = (dishCounts[i.name] || 0) + i.quantity; }));
  const topDishes = Object.entries(dishCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>{kitchen.name}</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 28 }}>
        {kitchen.isOpen ? 'Currently accepting orders' : 'Currently closed'} · ★ {kitchen.rating || '—'} ({kitchen.ratingCount || 0} reviews)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        <MetricCard label="Orders today" value={todaysOrders.length} />
        <MetricCard label="Revenue today" value={`₹${revenueToday.toLocaleString('en-IN')}`} />
        <MetricCard label="Total orders (all time)" value={orders.length} />
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Top dishes</h3>
        {topDishes.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No orders yet.</p>}
        {topDishes.map(([name, count]) => (
          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13.5 }}>{name}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{count} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
