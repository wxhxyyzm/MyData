import { useState } from 'react';
import { Flame, Pencil, Trash2 } from 'lucide-react';
import { DEFAULT_LOCATION_PRESETS, MOOD_OPTIONS } from '../presets';

export default function LogItem({ entry, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const note = entry.note || entry.extras?.note || '';
  const moodValue = entry.mood || entry.extras?.mood;
  const mood = MOOD_OPTIONS.find((item) => item.key === moodValue);
  const difficulty = entry.difficulty || entry.extras?.difficulty || 0;
  const locationKey = entry.location || entry.extras?.location;
  const locationPreset = locationKey ? DEFAULT_LOCATION_PRESETS.find((l) => l.key === locationKey) : null;
  const location = locationPreset ? `${locationPreset.emoji} ${locationPreset.label}` : (entry.extras?.customLocation || locationKey || '');
  const longNote = note.length > 90;

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 1800);
      return;
    }
    onDelete(entry.id);
  };

  return (
    <div className="border-b p-4 last:border-b-0" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center justify-between gap-4">
        <button className="flex-1 text-left" onClick={() => setExpanded((value) => !value)}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xl">{entry.emoji}</span>
            <span className="truncate font-semibold">{entry.name}</span>
            {mood && <span className="text-sm" title={mood.label}>{mood.emoji}</span>}
            {difficulty > 0 && <span className="mono text-xs" style={{ color: 'var(--accent)' }}>{'★'.repeat(difficulty)}</span>}
          </div>
          <div className="mono mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>
            {entry.type === 'cardio' ? (
              <>
                {entry.duration} min
                {entry.calories > 0 && <> · <Flame size={10} style={{ display: 'inline', verticalAlign: '-1px', color: 'var(--accent)' }} /> {entry.calories} kcal</>}
              </>
            ) : (
              <>{entry.sets} 组 × {entry.reps} 次</>
            )}
            {location && <> · {location}</>}
          </div>
        </button>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => onEdit(entry)} style={{ background: 'none', border: 'none', borderRadius: 6, color: 'var(--ink-soft)', cursor: 'pointer', padding: 6 }} title="编辑">
            <Pencil size={14} />
          </button>
          <button onClick={handleDelete} style={{ background: confirming ? 'var(--accent)' : 'none', border: 'none', borderRadius: 6, color: confirming ? 'white' : 'var(--ink-soft)', cursor: 'pointer', padding: 6 }} title={confirming ? '再点一次确认' : '删除'}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {note && (
        <div className="mt-3 text-sm leading-6" style={{ borderLeft: '2px solid var(--accent-soft)', color: 'var(--ink-soft)', fontStyle: 'italic', paddingLeft: 10 }}>
          {expanded || !longNote ? note : `${note.slice(0, 60)}...`}
          {longNote && <button className="mono ml-2 text-[11px]" style={{ color: 'var(--accent)' }} onClick={() => setExpanded((value) => !value)}>{expanded ? '收起' : '展开'}</button>}
        </div>
      )}
    </div>
  );
}
