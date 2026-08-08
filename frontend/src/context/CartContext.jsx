import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'avika_cart';
const ACTIVE_KITCHEN_KEY = 'avika_active_kitchen';

function readAllCarts() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function writeAllCarts(all) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

export function CartProvider({ children }) {
  const [kitchenId, setKitchenId] = useState(() => {
    try { return localStorage.getItem(ACTIVE_KITCHEN_KEY) || null; } catch { return null; }
  });
  const [items, setItems] = useState({}); // { menuItemId: quantity }

  useEffect(() => {
    if (!kitchenId) return;
    setItems(readAllCarts()[kitchenId] || {});
    try { localStorage.setItem(ACTIVE_KITCHEN_KEY, kitchenId); } catch { /* ignore */ }
  }, [kitchenId]);

  const persist = useCallback((next) => {
    if (!kitchenId) return;
    const all = readAllCarts();
    all[kitchenId] = next;
    writeAllCarts(all);
    setItems(next);
  }, [kitchenId]);

  // Switching to a different kitchen replaces the active cart — the product
  // rule (per the vision doc) is one cart belongs to one kitchen.
  const setActiveKitchen = useCallback((id) => {
    setKitchenId(id);
  }, []);

  const changeQty = useCallback((menuItemId, delta) => {
    const next = { ...items };
    next[menuItemId] = (next[menuItemId] || 0) + delta;
    if (next[menuItemId] <= 0) delete next[menuItemId];
    persist(next);
  }, [items, persist]);

  const clearCart = useCallback(() => {
    persist({});
  }, [persist]);

  const itemCount = Object.values(items).reduce((sum, q) => sum + q, 0);

  return (
    <CartContext.Provider value={{ kitchenId, items, itemCount, setActiveKitchen, changeQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
