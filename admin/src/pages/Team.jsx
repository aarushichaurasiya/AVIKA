import { useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { Loading, ErrorMessage } from '../components/Feedback';

export default function Team() {
  const [kitchenId, setKitchenId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', phone: '' });

  useEffect(() => {
    kitchenService.mine().then((res) => {
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setKitchenId(res.data._id);
      setEmployees(res.data.employees || []);
      setLoading(false);
    });
  }, []);

  async function addEmployee() {
    if (!form.name.trim()) return;
    const res = await kitchenService.addEmployee(kitchenId, form);
    if (!res.ok) return alert(res.error);
    setEmployees(res.data);
    setForm({ name: '', role: '', phone: '' });
  }

  async function removeEmployee(id) {
    const res = await kitchenService.removeEmployee(kitchenId, id);
    if (!res.ok) return alert(res.error);
    setEmployees(res.data);
  }

  if (loading) return <Loading label="Loading your team…" />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Team</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>People helping run your kitchen.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn" onClick={addEmployee}>Add</button>
      </div>

      {employees.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No team members yet.</p>}
      {employees.map((e) => (
        <div key={e._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600 }}>{e.name}</h4>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{e.role || 'Cook'}{e.phone ? ` · ${e.phone}` : ''}</p>
          </div>
          <button className="btn btn-ghost" onClick={() => removeEmployee(e._id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
