import { useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { Loading, ErrorMessage } from '../components/Feedback';

export default function Approvals() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    const res = await kitchenService.adminAll();
    if (!res.ok) { setError(res.error); setLoading(false); return; }
    setKitchens(res.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setApproval(id, approve) {
    const res = await kitchenService.approve(id, approve);
    if (!res.ok) return alert(res.error);
    load();
  }

  if (loading) return <Loading label="Loading kitchens…" />;

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Kitchen approvals</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>New kitchens stay hidden from customers until approved here.</p>
      <ErrorMessage message={error} />
      {kitchens.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No kitchens yet.</p>}
      {kitchens.map((k) => (
        <div key={k._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14.5, fontWeight: 600 }}>
              {k.name}{' '}
              <span className={`status-pill ${k.isApproved ? 'st-delivered' : 'st-placed'}`}>{k.isApproved ? 'Approved' : 'Pending'}</span>
            </h4>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{k.owner?.name} · {k.owner?.email} · {k.location?.address}</p>
          </div>
          {k.isApproved ? (
            <button className="btn btn-ghost" onClick={() => setApproval(k._id, false)}>Revoke</button>
          ) : (
            <button className="btn" onClick={() => setApproval(k._id, true)}>Approve</button>
          )}
        </div>
      ))}
    </div>
  );
}
