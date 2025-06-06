// ── File: frontend/src/components/TargetTable.jsx ────────────────────────
import axios from "axios";

export default function TargetTable({ targets, refresh }) {
  const togglePause = async (id) => {
    await axios.patch(`/targets/${id}`); refresh();
  };
  const remove = async (id) => {
    if (window.confirm("Delete this monitor?")) { await axios.delete(`/targets/${id}`); refresh(); }
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
              <td className={t.isUp ? "text-success" : "text-danger"}>{t.isUp ? "UP" : "DOWN"}</td>
              <td>{t.latency ?? "—"} ms</td>
              <td className={t.daysCert <= 14 ? "text-warning" : undefined}>{t.daysCert ?? "—"} d</td>
              <td className={t.daysDomain <= 14 ? "text-warning" : undefined}>{t.daysDomain ?? "—"} d</td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button className="btn btn-warning" onClick={() => togglePause(t.id)}>{t.paused ? "Resume" : "Pause"}</button>
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