import { useState } from 'react';
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
          <LogRow key={log.id} log={log} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function LogRow({ log, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 2000);
      return;
    }
    onDelete(log.id);
  };

  return (
    <div className="card flex items-center justify-between p-4">
      <span>{log.date} · {log.item_id}</span>
      <button
        className="btn-ghost min-h-0 px-3 py-2"
        onClick={handleDelete}
        title={confirming ? '再点一次确认删除' : '删除'}
        style={confirming ? { background: 'var(--accent)', color: 'white', borderRadius: 8 } : undefined}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="card p-5"><div className="mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>{label}</div><div className="display mt-2 text-3xl font-bold">{value}</div></div>;
}
