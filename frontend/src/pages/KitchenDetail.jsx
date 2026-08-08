import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kitchenService } from '../services/kitchenService';
import { useCart } from '../context/CartContext';
import MenuItemRow from '../components/MenuItemRow';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fmt } from '../utils/format';

export default function KitchenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itemCount, setActiveKitchen } = useCart();
  const [kitchen, setKitchen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveKitchen(id);
    async function load() {
      const [kRes, mRes] = await Promise.all([kitchenService.get(id), kitchenService.menu(id)]);
      if (!kRes.ok) { setError(kRes.error); setLoading(false); return; }
      setKitchen(kRes.data);
      setMenu(mRes.ok ? mRes.data : []);
      setLoading(false);
    }
    load();
  }, [id, setActiveKitchen]);

  if (loading) return <Loading label="Loading menu…" />;
  if (error) return <div className="wrap" style={{ padding: '40px 20px' }}><ErrorMessage message={error} /></div>;

  const hours = kitchen.operatingHours?.[0]
    ? `Open ${kitchen.operatingHours[0].openTime}–${kitchen.operatingHours[0].closeTime}`
    : null;

  const categories = [...new Set(menu.map((m) => m.category))];

  return (
    <div className="wrap" style={{ padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>{kitchen.name}</h1>
      <div style={{ display: 'flex', gap: 16, fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 28, flexWrap: 'wrap' }}>
        <span>★ {kitchen.rating || '—'} ({kitchen.ratingCount || 0} orders)</span>
        <span>{(kitchen.cuisine || []).join(', ')}</span>
        {hours && <span>{hours}</span>}
      </div>

      {menu.length === 0 && <ErrorMessage kind="info" message="This kitchen hasn't added any menu items yet." />}

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>{cat}</h3>
          {menu.filter((m) => m.category === cat).map((item) => (
            <MenuItemRow key={item._id} item={item} />
          ))}
        </div>
      ))}

      {itemCount > 0 && (
        <button className="btn btn-primary" style={{ position: 'fixed', bottom: 24, right: 24, padding: '14px 28px' }} onClick={() => navigate('/checkout')}>
          Go to checkout ({itemCount} item{itemCount > 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}
