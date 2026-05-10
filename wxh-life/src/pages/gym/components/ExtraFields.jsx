import { useMemo, useState } from 'react';
import EmojiPicker from './EmojiPicker';
import { DEFAULT_LOCATION_PRESETS, EMOJI_PALETTE_LOCATION, MOOD_OPTIONS } from '../presets';

export default function ExtraFields({ extras, setExtras, custom, onAddCustomPreset }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [customLocOpen, setCustomLocOpen] = useState(false);
  const [customLocEmoji, setCustomLocEmoji] = useState('📍');
  const allLocations = useMemo(() => [...DEFAULT_LOCATION_PRESETS, ...(custom?.locations || [])], [custom]);
  const update = (patch) => setExtras({ ...extras, ...patch });

  const handleCustomLocCommit = async () => {
    const label = (extras.customLocation || '').trim();
    if (!label) return;
    const existing = allLocations.find((location) => location.label === label);
    if (existing) {
      update({ location: existing.key, customLocation: '' });
      setCustomLocOpen(false);
      return;
    }
    const newKey = `user_${Date.now()}`;
    await onAddCustomPreset('locations', { key: newKey, emoji: customLocEmoji || '📍', label });
    update({ location: newKey, customLocation: '' });
    setCustomLocOpen(false);
    setCustomLocEmoji('📍');
  };

  return (
    <div className="mb-5" style={{ paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest mono block mb-2" style={{ color: 'var(--ink-faint)' }}>
          今天感觉 <span style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>· 可选</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const active = extras.mood === mood.key;
            return (
              <button
                key={mood.key}
                onClick={() => update({ mood: active ? null : mood.key })}
                className="flex flex-col items-center justify-center"
                style={{
                  width: 58,
                  padding: '8px 4px',
                  border: `1.5px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 12,
                  background: active ? 'var(--ink)' : 'var(--bg-card)',
                  color: active ? 'var(--bg)' : 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{mood.emoji}</span>
                <span style={{ fontSize: 10, marginTop: 4, opacity: 0.9 }}>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest mono block mb-2" style={{ color: 'var(--ink-faint)' }}>
          难度 <span style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>· 可选</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((level) => {
            const filled = level <= extras.difficulty;
            return (
              <button
                key={level}
                onClick={() => update({ difficulty: extras.difficulty === level ? 0 : level })}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  fontSize: 28,
                  lineHeight: 1,
                  filter: filled ? 'none' : 'grayscale(1) opacity(0.3)',
                  transition: 'filter 0.15s ease, transform 0.1s ease',
                }}
              >
                🔥
              </button>
            );
          })}
          {extras.difficulty > 0 && <span className="mono text-xs ml-1" style={{ color: 'var(--ink-soft)' }}>{extras.difficulty}/5</span>}
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest mono block mb-2" style={{ color: 'var(--ink-faint)' }}>
          场地 <span style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>· 可选</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {allLocations.map((location) => {
            const active = extras.location === location.key;
            return (
              <button
                key={location.key}
                className={`chip ${active ? 'active' : ''}`}
                onClick={() => update({ location: active ? null : location.key })}
              >
                <span>{location.emoji}</span> {location.label}
              </button>
            );
          })}
          <button className={`chip ${customLocOpen ? 'active' : ''}`} onClick={() => setCustomLocOpen((open) => !open)}>+ 新地点</button>
        </div>
        {customLocOpen && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--bg)', border: '1px dashed var(--line)' }}>
            <div className="flex gap-2 items-start">
              <EmojiPicker value={customLocEmoji} onChange={setCustomLocEmoji} palette={EMOJI_PALETTE_LOCATION} size={44} />
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="地点名称，例如：小区健身房"
                value={extras.customLocation}
                onChange={(event) => update({ customLocation: event.target.value })}
                onBlur={handleCustomLocCommit}
                onKeyDown={(event) => { if (event.key === 'Enter') handleCustomLocCommit(); }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setNoteOpen((open) => !open)}
          className="text-xs uppercase tracking-widest mono"
          style={{ color: noteOpen || extras.note ? 'var(--accent)' : 'var(--ink-faint)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {noteOpen || extras.note ? '笔记' : '+ 添加笔记'}
        </button>
        {(noteOpen || extras.note) && (
          <textarea
            className="input mt-2"
            rows={3}
            placeholder="今天训练感觉如何？"
            value={extras.note}
            onChange={(event) => update({ note: event.target.value })}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        )}
      </div>
    </div>
  );
}
