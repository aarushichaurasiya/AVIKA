import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { kitchenService } from '../services/kitchenService';
import { orderService } from '../services/orderService';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { fmt } from '../utils/format';

const TAX_RATE = 0.05;

export default function Checkout() {
  const { kitchenId, items, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [kitchen, setKitchen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (!kitchenId) { setLoading(false); return; }
    async function load() {
      const [kRes, mRes] = await Promise.all([kitchenService.get(kitchenId), kitchenService.menu(kitchenId)]);
      if (kRes.ok) setKitchen(kRes.data);
      if (mRes.ok) setMenu(mRes.data);
      setLoading(false);
    }
    load();
  }, [kitchenId, isLoggedIn, navigate]);

  if (loading) return <Loading label="Loading your order…" />;
  if (!kitchenId || Object.keys(items).length === 0) {
    return <div className="wrap" style={{ padding: '60px 20px' }}><ErrorMessage kind="info" message="Your cart is empty." /></div>;
  }

  const lines = Object.entries(items).map(([id, qty]) => {
    const menuItem = menu.find((m) => m._id === id);
    return menuItem ? { ...menuItem, qty } : null;
  }).filter(Boolean);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const delivery = kitchen?.freeDeliveryThreshold && subtotal >= kitchen.freeDeliveryThreshold ? 0 : (kitchen?.deliveryFee ?? 25);
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + delivery + taxes;

  async function handlePlaceOrder() {
    setError(null);
    if (!phone.trim()) return setError('Enter a phone number so the kitchen can reach you.');

    setPlacing(true);
    const res = await orderService.create({
      kitchenId,
      items: lines.map((l) => ({ menuItemId: l._id, quantity: l.qty })),
      deliveryAddress: { line1: 'Address on file', city: 'Coimbatore', phone: phone.trim() },
      paymentMethod
    });
    setPlacing(false);

    if (!res.ok) return setError(res.error);

    if (paymentMethod !== 'cod') {
      const intentRes = await orderService.createPaymentIntent(res.data._id);
      if (!intentRes.ok) return setError('Order placed, but payment setup failed: ' + intentRes.error);
      // Full Stripe Elements confirmation flow lives in the legacy checkout.html
      // as a working reference — porting it here is the next increment.
    }

    clearCart();
    navigate('/orders');
  }

  return (
    <div className="wrap" style={{ padding: '40px 20px 80px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Checkout</h1>
      <ErrorMessage message={error} />

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Order from {kitchen?.name}</h3>
        {lines.map((l) => (
          <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}>
            <span>{l.qty}× {l.name}</span><span>{fmt(l.price * l.qty)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 6 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 6 }}><span>Delivery</span><span>{delivery === 0 ? 'Free' : fmt(delivery)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 10 }}><span>Taxes</span><span>{fmt(taxes)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 10 }}><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <label htmlFor="phone">Phone number</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Payment method</h3>
        {['card', 'upi', 'cod'].map((m) => (
          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: '1.5px solid var(--line)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <input type="radio" name="pay" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} style={{ width: 'auto' }} />
            {m === 'cod' ? 'Cash on delivery' : m.toUpperCase()}
          </label>
        ))}
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={placing} onClick={handlePlaceOrder}>
        {placing ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  );
}
