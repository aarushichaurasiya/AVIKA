import { useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { menuService } from '../services/menuService';
import { Loading, ErrorMessage } from '../components/Feedback';

export default function Menu() {
  const [kitchenId, setKitchenId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: "Today's tiffin", price: '', description: '', isSpecial: false });

  useEffect(() => {
    async function load() {
      const kRes = await kitchenService.mine();
      if (!kRes.ok) { setError(kRes.error); setLoading(false); return; }
      setKitchenId(kRes.data._id);
      const mRes = await menuService.list(kRes.data._id);
      if (mRes.ok) setItems(mRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleAvailable(item) {
    const res = await menuService.update(kitchenId, item._id, { isAvailable: !item.isAvailable });
    if (!res.ok) return alert(res.error);
    setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
  }

  async function removeItem(item) {
    const res = await menuService.remove(kitchenId, item._id);
    if (!res.ok) return alert(res.error);
    setItems((prev) => prev.filter((i) => i._id !== item._id));
  }

  async function handleAdd(e) {
    e.preventDefault();
    const res = await menuService.create(kitchenId, { ...form, price: Number(form.price) });
    if (!res.ok) return alert(res.error);
    setItems((prev) => [...prev, res.data]);
    setModalOpen(false);
    setForm({ name: '', category: "Today's tiffin", price: '', description: '', isSpecial: false });
  }

  if (loading) return <Loading label="Loading your menu…" />;
  if (error) return <ErrorMessage message={error} />;

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Menu</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>What's available to order right now.</p>
        </div>
        <button className="btn" onClick={() => setModalOpen(true)}>+ Add item</button>
      </div>

      {items.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No menu items yet — add your first one.</p>}

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 26 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>{cat}</h3>
          {items.filter((i) => i.category === cat).map((item) => (
            <div key={item._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14.5, fontWeight: 600 }}>
                  {item.name}{' '}
                  {item.isSpecial && <span style={{ fontSize: 10, fontWeight: 700, color: '#C4903E', background: 'rgba(196,144,62,0.15)', padding: '2px 7px', borderRadius: 100 }}>★ Special</span>}
                </h4>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{item.description}</p>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, width: 60 }}>₹{item.price}</div>
              <button
                onClick={() => toggleAvailable(item)}
                aria-pressed={item.isAvailable}
                style={{
                  width: 38, height: 22, borderRadius: 100, border: 'none', cursor: 'pointer', position: 'relative',
                  background: item.isAvailable ? 'var(--success)' : 'var(--line)'
                }}
              >
                <span style={{ position: 'absolute', top: 2, left: item.isAvailable ? 18 : 2, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .15s' }} />
              </button>
              <button onClick={() => removeItem(item)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }} aria-label={`Delete ${item.name}`}>✕</button>
            </div>
          ))}
        </div>
      ))}

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,23,32,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }} onClick={() => setModalOpen(false)}>
          <div className="card" style={{ width: 420, padding: 26 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Add menu item</h3>
            <form onSubmit={handleAdd}>
              <label htmlFor="m-name">Name</label>
              <input id="m-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label htmlFor="m-cat">Category</label>
                  <select id="m-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Today's tiffin</option>
                    <option>Sides & extras</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="m-price">Price (₹)</label>
                  <input id="m-price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <label htmlFor="m-desc">Description</label>
              <textarea id="m-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: 'var(--ink)', marginBottom: 18 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={form.isSpecial} onChange={(e) => setForm({ ...form, isSpecial: e.target.checked })} />
                Mark as today's special
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn" style={{ flex: 1 }}>Save item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
