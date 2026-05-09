import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Lightbulb, Pencil } from '../../../icons';

export default function PlanView({ modules, subtitleMap = {}, doneItemIds, todayDoneIds, notes, onCheckin, onAddNote, onSaveSubtitle }) {
  return (
    <div className="mt-4 space-y-4">
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          subtitle={subtitleMap[module.id] !== undefined ? subtitleMap[module.id] : module.defaultSubtitle}
          doneItemIds={doneItemIds}
          todayDoneIds={todayDoneIds}
          notes={notes}
          onCheckin={onCheckin}
          onAddNote={onAddNote}
          onSaveSubtitle={onSaveSubtitle ? (sub) => onSaveSubtitle(module.id, sub) : null}
        />
      ))}
    </div>
  );
}

function ModuleCard({ module, subtitle, doneItemIds, todayDoneIds, notes, onCheckin, onAddNote, onSaveSubtitle }) {
  const doneCount = module.items.filter((item) => doneItemIds.has(item.id)).length;
  const total = module.items.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const [expanded, setExpanded] = useState(module.id === 'm1');
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [subtitleDraft, setSubtitleDraft] = useState(subtitle);

  const handleSubtitleSave = () => {
    onSaveSubtitle?.(subtitleDraft);
    setEditingSubtitle(false);
  };

  return (
    <section className="card overflow-hidden">
      <div className="w-full p-4 text-left cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-base">{module.emoji} {module.title}</div>
            {editingSubtitle ? (
              <div className="mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={subtitleDraft}
                  onChange={(e) => setSubtitleDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubtitleSave(); if (e.key === 'Escape') setEditingSubtitle(false); }}
                  style={{ flex: 1, fontSize: 12, padding: '3px 8px', border: '1px solid var(--accent)', borderRadius: 6, fontFamily: 'var(--font-mono)', outline: 'none', background: 'var(--bg-card)', color: 'var(--ink)' }}
                />
                <button onClick={handleSubtitleSave} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>保存</button>
              </div>
            ) : (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{subtitle}</span>
                {onSaveSubtitle && (
                  <button onClick={(e) => { e.stopPropagation(); setSubtitleDraft(subtitle); setEditingSubtitle(true); }} style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', padding: 2 }}>
                    <Pencil size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <div className="display text-xl font-bold" style={{ color: module.color || 'var(--accent)' }}>{pct}%</div>
              <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{doneCount}/{total}</div>
            </div>
            {expanded ? <ChevronUp size={16} style={{ color: 'var(--ink-faint)' }} /> : <ChevronDown size={16} style={{ color: 'var(--ink-faint)' }} />}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: module.color || 'var(--accent)', transition: 'width 0.25s ease' }} />
        </div>
      </div>
      {expanded && (
        <div className="border-t" style={{ borderColor: 'var(--line)' }}>
          {module.items.map((item) => {
            const done = doneItemIds.has(item.id);
            const todayDone = todayDoneIds.has(item.id);
            const itemNotes = notes.filter((note) => note.item_id === item.id);
            const unresolved = itemNotes.filter((note) => !note.resolved).length;
            return (
              <div key={item.id} className="border-b p-4 last:border-b-0" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: done ? (module.colorSoft || 'var(--accent-soft)') : 'var(--bg)', color: done ? (module.color || 'var(--accent)') : 'var(--ink-faint)', border: '1px solid var(--line)' }}>
                    {done ? <Check size={13} /> : item.type === 'video' ? '▶' : item.type === 'code' ? '⌘' : '📖'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-0.5 text-xs leading-5" style={{ color: 'var(--ink-soft)' }}>{item.desc}</div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button className="btn-primary min-h-0 px-3 py-1.5 text-xs" disabled={todayDone} onClick={() => onCheckin(item)}>
                        <Check size={13} />{todayDone ? '今日已打卡' : '打卡'}
                      </button>
                      <button className="btn-ghost min-h-0 px-3 py-1.5 text-xs" onClick={() => onAddNote(item)}>
                        <Lightbulb size={13} />加难点{unresolved > 0 ? ` · ${unresolved}` : ''}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
