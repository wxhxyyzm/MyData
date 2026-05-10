import { Trash2 } from '../../../icons';
import Heatmap from '../components/Heatmap';
import TrendChart from '../components/TrendChart';

export default function HistoryView({ logs, onDelete }) {
  const activeDays = new Set(logs.map((log) => log.date)).size;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="打卡总次数" value={logs.length} />
        <Stat label="活跃天数" value={activeDays} />
      </div>
      <Heatmap logs={logs} />
      <TrendChart logs={logs} />
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="card flex items-center justify-between p-4">
            <span>{log.date} · {log.item_id}</span>
            <button className="btn-ghost min-h-0 px-3 py-2" onClick={() => onDelete(log.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="card p-5"><div className="mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>{label}</div><div className="display mt-2 text-3xl font-bold">{value}</div></div>;
}
