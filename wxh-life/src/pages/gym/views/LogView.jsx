import { useState } from 'react';
import EditEntryModal from '../components/EditEntryModal';
import LogItem from '../components/LogItem';
import { Dumbbell, Heart } from '../../../icons';

export default function LogView({ entries, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const filtered = entries.filter((entry) => filter === 'all' || entry.type === filter);
  const grouped = filtered.reduce((acc, entry) => {
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});
  const groups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

  return (
    <section className="animate-in">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部</button>
        <button className={`chip ${filter === 'cardio' ? 'active' : ''}`} onClick={() => setFilter('cardio')}><Heart size={13} /> 有氧</button>
        <button className={`chip ${filter === 'strength' ? 'active' : ''}`} onClick={() => setFilter('strength')}><Dumbbell size={13} /> 无氧</button>
      </div>

      {groups.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mb-3 text-5xl">📭</div>
          <div className="display text-lg font-semibold">还没有记录</div>
          <div className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>去「记录」页添加一次训练。</div>
        </div>
      ) : groups.map(([date, items]) => (
        <div key={date} className="mb-5">
          <div className="mono mb-2 px-1 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
            {formatDateDisplay(date)} · {items.length} 条
          </div>
          <div className="card overflow-hidden">
            {items.map((entry) => <LogItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={setEditing} />)}
          </div>
        </div>
      ))}
      {editing && <EditEntryModal entry={editing} onClose={() => setEditing(null)} onSave={(next) => { onUpdate(next); setEditing(null); }} />}
    </section>
  );
}

function formatDateDisplay(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}
