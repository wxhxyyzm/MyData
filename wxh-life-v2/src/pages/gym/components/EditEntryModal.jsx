import { useState } from 'react';
import { Check, X } from '../../../icons';
import { DEFAULT_LOCATION_PRESETS, MOOD_OPTIONS } from '../presets';

export default function EditEntryModal({ entry, custom, onClose, onSave }) {
  const [duration, setDuration] = useState(String(entry.duration || ''));
  const [calories, setCalories] = useState(String(entry.calories || ''));
  const [sets, setSets] = useState(String(entry.sets || ''));
  const [reps, setReps] = useState(String(entry.reps || ''));
  const [date, setDate] = useState(entry.date || '');
  const [mood, setMood] = useState(entry.mood || null);
  const [difficulty, setDifficulty] = useState(entry.difficulty || 0);
  const [location, setLocation] = useState(entry.location || null);
  const [note, setNote] = useState(entry.note || entry.extras?.note || '');

  const allLocations = [...DEFAULT_LOCATION_PRESETS, ...(custom?.locations || [])];

  const handleSave = () => {
    const patch = { date, mood, difficulty, location, note };
    if (entry.type === 'cardio') {
      patch.duration = parseFloat(duration) || 0;
      patch.calories = parseInt(calories) || 0;
    } else {
      patch.sets = parseInt(sets) || 0;
      patch.reps = parseInt(reps) || 0;
    }
    onSave({ ...entry, ...patch });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-y-auto"
        style={{ background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>Edit</div>
            <div className="display text-2xl font-bold flex items-center gap-2">
              <span>{entry.emoji}</span> {entry.name}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-soft)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Type-specific fields */}
        {entry.type === 'cardio' ? (
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mono mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>时长 (分钟)</label>
              <input className="input mono" type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div>
              <label className="mono mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>卡路里</label>
              <input className="input mono" type="number" inputMode="decimal" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mono mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>组数</label>
              <input className="input mono" type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
            <div>
              <label className="mono mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>每组次数</label>
              <input className="input mono" type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
          </div>
        )}

        {/* Date */}
        <div className="mb-5">
          <label className="mono mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>日期</label>
          <input className="input mono" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Mood */}
        <div className="mb-5">
          <label className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>心情 · 可选</label>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button key={m.key} onClick={() => setMood(mood === m.key ? null : m.key)} style={{ flex: 1, padding: '8px 4px', border: `1.5px solid ${mood === m.key ? 'var(--ink)' : 'var(--line)'}`, borderRadius: 10, background: mood === m.key ? 'var(--ink)' : 'var(--bg-card)', color: mood === m.key ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-body)' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-5">
          <label className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>难度 · 可选</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setDifficulty(difficulty === n ? 0 : n)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', fontSize: 26, filter: n <= difficulty ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</button>
            ))}
            {difficulty > 0 && <span className="mono ml-1 text-xs" style={{ color: 'var(--ink-soft)' }}>{['', '很轻松', '轻松', '适中', '困难', '极限'][difficulty]}</span>}
          </div>
        </div>

        {/* Location */}
        {allLocations.length > 0 && (
          <div className="mb-5">
            <label className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>场地 · 可选</label>
            <div className="flex flex-wrap gap-2">
              {allLocations.map((loc) => (
                <button key={loc.key} className={`chip ${location === loc.key ? 'active' : ''}`} onClick={() => setLocation(location === loc.key ? null : loc.key)}>
                  {loc.emoji} {loc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mb-5">
          <label className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>备注 · 可选</label>
          <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="今天状态不错..." style={{ resize: 'vertical', minHeight: 72 }} />
        </div>

        <div className="flex gap-3 pb-2">
          <button className="btn-ghost flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-[2]" onClick={handleSave}><Check size={15} /> 保存修改</button>
        </div>
      </div>
    </div>
  );
}
