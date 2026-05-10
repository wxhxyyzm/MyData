import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Lightbulb } from '../../../icons';

export default function PlanView({ modules, doneItemIds, todayDoneIds, notes, onCheckin, onAddNote, onArchive }) {
  return (
    <div className="mt-4 space-y-4">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} doneItemIds={doneItemIds} todayDoneIds={todayDoneIds} notes={notes} onCheckin={onCheckin} onAddNote={onAddNote} />
      ))}
      <button className="btn-ghost" onClick={onArchive}>归档计划</button>
    </div>
  );
}

function ModuleCard({ module, doneItemIds, todayDoneIds, notes, onCheckin, onAddNote }) {
  const doneCount = module.items.filter((item) => doneItemIds.has(item.id)).length;
  const total = module.items.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const [expanded, setExpanded] = useState(module.id === 'm1');

  return (
    <section className="card overflow-hidden">
      <button className="w-full p-5 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="display text-xl font-bold">{module.emoji} {module.title}</div>
            <div className="mono mt-1 text-[11px]" style={{ color: 'var(--ink-faint)' }}>{module.defaultSubtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="display text-2xl font-bold" style={{ color: module.color || 'var(--accent)' }}>{pct}%</div>
              <div className="mono text-[10px]" style={{ color: 'var(--ink-faint)' }}>{doneCount}/{total}</div>
            </div>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: module.color || 'var(--accent)', transition: 'width 0.25s ease' }} />
        </div>
      </button>
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
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: done ? (module.colorSoft || 'var(--accent-soft)') : 'var(--bg)', color: done ? (module.color || 'var(--accent)') : 'var(--ink-faint)', border: '1px solid var(--line)' }}>
                    {done ? <Check size={15} /> : item.type === 'video' ? '▶' : item.type === 'code' ? '⌘' : '📖'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="mt-1 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{item.desc}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="btn-primary min-h-0 px-3 py-2 text-xs" disabled={todayDone} onClick={() => onCheckin(item)}>
                        <Check size={14} />{todayDone ? '今日已打卡' : '打卡'}
                      </button>
                      <button className="btn-ghost min-h-0 px-3 py-2 text-xs" onClick={() => onAddNote(item)}>
                        <Lightbulb size={14} />加难点{unresolved > 0 ? ` · ${unresolved}` : ''}
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
