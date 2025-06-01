import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
export default function TargetList({ targets }) {
  return (
    <table className="w-full text-left">
      <thead><tr>
        <th>Label</th><th>Status</th><th>Latency</th>
        <th>SSL</th><th>Domain</th><th>Chart (24 h)</th>
      </tr></thead>
      <tbody>
        {targets.map(t => (
          <tr key={t.id}>
            <td>{t.label}</td>
            <td className={t.isUp ? "text-green-600" : "text-red-600"}>
              {t.isUp ? "UP" : "DOWN"}
            </td>
            <td>{t.latency} ms</td>
            <td className={t.daysCert <= 14 && "text-orange-500"}>
              {t.daysCert} d
            </td>
            <td className={t.daysDomain <= 14 && "text-orange-500"}>
              {t.daysDomain} d
            </td>
            <td>
              <LineChart width={150} height={50} data={t.last24h}>
                <XAxis dataKey="time" hide /><YAxis hide domain={[0, 'dataMax']} />
                <Tooltip /><Line type="monotone" dataKey="latency" dot={false} />
              </LineChart>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}