import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { kitchenService } from '../services/kitchenService';
import { userService } from '../services/userService';
import ErrorMessage from '../components/ErrorMessage';

export default function KitchenSetup() {
  const [params] = useSearchParams();
  const editId = params.get('id');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', cuisine: '', description: '', address: '', lat: '', lng: '',
    deliveryFee: 25, freeDeliveryThreshold: 300, minOrderAmount: 0, avgPrepTimeMinutes: 30,
    opensAt: '09:00', closesAt: '21:00', logoUrl: ''
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    kitchenService.get(editId).then((res) => {
      if (!res.ok) { setError(res.error); return; }
      const k = res.data;
      setForm({
        name: k.name || '', cuisine: (k.cuisine || []).join(', '), description: k.description || '',
        address: k.location?.address || '', lat: k.location?.coordinates?.[1] || '', lng: k.location?.coordinates?.[0] || '',
        deliveryFee: k.deliveryFee ?? 25, freeDeliveryThreshold: k.freeDeliveryThreshold ?? 300,
        minOrderAmount: k.minOrderAmount ?? 0, avgPrepTimeMinutes: k.avgPrepTimeMinutes ?? 30,
        opensAt: k.operatingHours?.[0]?.openTime || '09:00', closesAt: k.operatingHours?.[0]?.closeTime || '21:00',
        logoUrl: k.logoUrl || ''
      });
    });
  }, [editId]);

  function set(field) { return (e) => setForm((f) => ({ ...f, [field]: e.target.value })); }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus('Uploading…');
    const res = await userService.uploadImage(file);
    if (!res.ok) { setUploadStatus('Upload failed: ' + res.error); return; }
    setForm((f) => ({ ...f, logoUrl: res.data.url }));
    setUploadStatus('Uploaded ✓');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setSuccess(null); setSaving(true);

    const payload = {
      name: form.name.trim(),
      logoUrl: form.logoUrl || undefined,
      cuisine: form.cuisine.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description.trim(),
      location: { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)], address: form.address.trim() },
      deliveryFee: Number(form.deliveryFee) || 0,
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      avgPrepTimeMinutes: Number(form.avgPrepTimeMinutes) || 30,
      operatingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, openTime: form.opensAt, closeTime: form.closesAt }))
    };

    const res = editId ? await kitchenService.update(editId, payload) : await kitchenService.create(payload);
    setSaving(false);
    if (!res.ok) return setError(res.error);

    setSuccess(editId ? 'Saved.' : "Saved — pending admin approval before it goes live.");
    setTimeout(() => navigate('/'), 1200);
  }

  return (
    <div className="wrap" style={{ padding: '40px 20px 80px', maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Your kitchen</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 24 }}>This is what customers see when they find you nearby.</p>
      <div className="card" style={{ padding: 26 }}>
        <ErrorMessage message={error} />
        <ErrorMessage message={success} kind="success" />
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Kitchen name</label>
          <input id="name" value={form.name} onChange={set('name')} required style={{ marginBottom: 14 }} />

          <label htmlFor="photo">Kitchen photo</label>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ marginBottom: 4 }} />
          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 14 }}>{uploadStatus}</p>

          <label htmlFor="cuisine">Cuisine (comma separated)</label>
          <input id="cuisine" value={form.cuisine} onChange={set('cuisine')} placeholder="South Indian, Tiffin" style={{ marginBottom: 14 }} />

          <label htmlFor="description">Description</label>
          <textarea id="description" value={form.description} onChange={set('description')} rows={3} style={{ marginBottom: 14 }} />

          <label htmlFor="address">Address</label>
          <input id="address" value={form.address} onChange={set('address')} required style={{ marginBottom: 14 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label htmlFor="lat">Latitude</label><input id="lat" value={form.lat} onChange={set('lat')} required /></div>
            <div><label htmlFor="lng">Longitude</label><input id="lng" value={form.lng} onChange={set('lng')} required /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label htmlFor="opensAt">Opens at</label><input id="opensAt" value={form.opensAt} onChange={set('opensAt')} /></div>
            <div><label htmlFor="closesAt">Closes at</label><input id="closesAt" value={form.closesAt} onChange={set('closesAt')} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div><label htmlFor="deliveryFee">Delivery fee (₹)</label><input id="deliveryFee" value={form.deliveryFee} onChange={set('deliveryFee')} /></div>
            <div><label htmlFor="freeAt">Free delivery over (₹)</label><input id="freeAt" value={form.freeDeliveryThreshold} onChange={set('freeDeliveryThreshold')} /></div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} disabled={saving}>
            {saving ? 'Saving…' : 'Save kitchen'}
          </button>
        </form>
      </div>
    </div>
  );
}
