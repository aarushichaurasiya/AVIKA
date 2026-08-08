import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { kitchenService } from '../services/kitchenService';
import KitchenCard from '../components/KitchenCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const YOU = { lat: 11.0058, lng: 76.9646 };

export default function Home() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await kitchenService.near(YOU.lat, YOU.lng, 20);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setKitchens(res.data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (loading || error || !mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([YOU.lat, YOU.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    L.circleMarker([YOU.lat, YOU.lng], { radius: 7, color: '#2B1720', fillColor: '#2B1720', fillOpacity: 1 })
      .addTo(map).bindPopup('You');

    kitchens.forEach((k) => {
      if (!k.location?.coordinates) return;
      const [lng, lat] = k.location.coordinates;
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${k.name}</b><br/>${(k.cuisine || []).join(', ')}`)
        .on('click', () => navigate(`/kitchens/${k._id}`));
    });
    mapInstance.current = map;
  }, [loading, error, kitchens, navigate]);

  return (
    <div>
      <section className="wrap" style={{ padding: '60px 0 30px' }}>
        <span style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: 'var(--teal-dark)', background: 'rgba(27,122,140,0.1)', padding: '6px 14px', borderRadius: 100, marginBottom: 18 }}>
          📍 Coimbatore and growing
        </span>
        <h1 style={{ fontSize: 'clamp(34px,5vw,54px)', lineHeight: 1.05, marginBottom: 16 }}>
          Homemade meals from kitchens <em style={{ color: 'var(--maroon)', fontStyle: 'italic' }}>near you</em>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-soft)', maxWidth: 460 }}>
          Avika connects you with local home cooks and small food businesses — real recipes, small batches, no ghost kitchens.
        </p>
      </section>

      <section className="wrap" style={{ padding: '30px 0' }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Kitchens near you</h2>
        {loading && <Loading label="Finding kitchens near you…" />}
        <ErrorMessage message={error} />
        {!loading && !error && kitchens.length === 0 && (
          <ErrorMessage kind="info" message="No approved kitchens nearby yet." />
        )}
        {!loading && !error && kitchens.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20, marginBottom: 34 }}>
            {kitchens.map((k) => <KitchenCard key={k._id} kitchen={k} />)}
          </div>
        )}
        <div ref={mapRef} style={{ height: 420, borderRadius: 18, border: '1px solid var(--line)' }} />
      </section>
    </div>
  );
}
