// ── File: frontend/src/pages/DashboardPage.jsx ───────────────────────────
import { useEffect, useState } from "react";
import axios from "axios";
import TargetTable from "./../pages/TargetTable";

export default function DashboardPage() {
  const [targets, setTargets] = useState([]);
  const [alerts, setAlerts]  = useState([]);
  const [form, setForm] = useState({ url: "", label: "" });

  const loadData = async () => {
    const [tRes, aRes] = await Promise.all([axios.get("/targets"), axios.get("/alerts")]);
    setTargets(tRes.data);
    setAlerts(aRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post("/targets", form);
    setForm({ url: "", label: "" });
    loadData();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Dashboard</h2>

      {/* Add‑Monitor Form */}
      <form className="row g-3 mb-4" onSubmit={handleAdd}>
        <div className="col-md-6"><input className="form-control" placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required /></div>
        <div className="col-md-4"><input className="form-control" placeholder="Label" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
        <div className="col-md-2 d-grid"><button className="btn btn-primary">Add</button></div>
      </form>

      {/* Targets Table */}
      <TargetTable targets={targets} refresh={loadData} />

      {/* Alerts List */}
      <h4 className="mt-5">Alerts</h4>
      <ul className="list-group">
        {alerts.map(a => (
          <li key={a.id} className="list-group-item d-flex justify-content-between">
            <span><strong>{a.type}</strong> – {a.message}</span>
    <span className="badge bg-secondary">
  {new Date(a.created_at).toLocaleString()}
</span>



          </li>
        ))}
      </ul>
    </div>
  );
}
