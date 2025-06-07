// ── File: frontend/src/components/TargetTable.jsx ────────────────────────
import api from "../lib/axios"

export default function TargetTable({ targets, refresh }) {
  const togglePause = async (id) => {
    await api.patch(`/targets/${id}`); refresh();
  };
  const remove = async (id) => {
    if (window.confirm("Delete this monitor?")) { await api.delete(`/targets/${id}`); refresh(); }
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light"><tr>
          <th>Label</th><th>URL</th><th>Status</th><th>Latency</th><th>SSL</th><th>Domain</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {targets.map(t => (
            <tr key={t.id}>
  <td>{t.label || "—"}</td>
  <td><a href={t.url} target="_blank" rel="noreferrer">{t.url}</a></td>
  <td className={t.isUp === true ? "text-success" : "text-danger"}>
    {t.isUp === true ? "UP" : "DOWN"}
  </td>
  <td>{t.latency !== null ? `${t.latency} ms` : "—"}</td>
<td>{t.daysCert != null && t.daysCert >= 0 ? `${t.daysCert} d` : '—'}</td>
<td>{t.daysDomain != null && t.daysDomain >= 0 ? `${t.daysDomain} d` : '—'}</td>


  <td>
    <div className="btn-group btn-group-sm" role="group">
      <button className="btn btn-warning" onClick={() => togglePause(t.id)}>
        {t.paused ? "Resume" : "Pause"}
      </button>
      <button className="btn btn-danger" onClick={() => remove(t.id)}>Delete</button>
    </div>
  </td>
</tr>

          ))}
        </tbody>
      </table>
    </div>
  );
}