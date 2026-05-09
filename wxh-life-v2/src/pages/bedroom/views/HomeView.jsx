import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, RotateCcw } from '../../../icons';
import { useAuth } from '../../../hooks/useAuth';
import { PHASES, phaseDates } from '../plans';
import { formatDate, todayStr } from '../../../lib/utils';

function loadArchivedIds() {
  try { return JSON.parse(localStorage.getItem('bedroom_archived_phases') || '[]'); }
  catch { return []; }
}

function saveArchivedIds(ids) {
  localStorage.setItem('bedroom_archived_phases', JSON.stringify(ids));
}

export default function HomeView({ logs = [] }) {
  const { isOwner } = useAuth();
  const logDates = new Set(logs.map((log) => log.date));
  const today = todayStr();
  const [archivedIds, setArchivedIds] = useState(loadArchivedIds);

  const archivePhase = (id) => {
    const next = [...archivedIds, id];
    setArchivedIds(next);
    saveArchivedIds(next);
  };

  const restorePhase = (id) => {
    const next = archivedIds.filter((x) => x !== id);
    setArchivedIds(next);
    saveArchivedIds(next);
  };

  const active = PHASES.filter((p) => !archivedIds.includes(p.id));
  const archived = PHASES.filter((p) => archivedIds.includes(p.id));

  const totalFilled = PHASES.reduce((sum, phase) => {
    const dates = phaseDates(phase);
    return sum + dates.filter((d) => logDates.has(d)).length;
  }, 0);

  return (
    <main className="mx-auto max-w-md pb-10 animate-in">
      <div className="px-5 pt-3 pb-5">
        <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>
          {PHASES.length} 个阶段 · 累计 {totalFilled} 天已打卡
        </div>
      </div>
      <div className="px-5 space-y-3">
        {active.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            logDates={logDates}
            today={today}
            onArchive={isOwner ? () => archivePhase(phase.id) : null}
          />
        ))}
        {active.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--ink-faint)' }}>暂无进行中的阶段</div>
        )}
      </div>
      {archived.length > 0 && (
        <details className="mt-6 px-5">
          <summary className="mono cursor-pointer text-xs py-1" style={{ color: 'var(--ink-faint)', listStyle: 'none' }}>
            ▸ 已归档 · {archived.length}
          </summary>
          <div className="mt-3 space-y-3">
            {archived.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                logDates={logDates}
                today={today}
                onRestore={isOwner ? () => restorePhase(phase.id) : null}
              />
            ))}
          </div>
        </details>
      )}
    </main>
  );
}

function PhaseCard({ phase, logDates, today, onArchive, onRestore }) {
  const dates = phaseDates(phase);
  const filledDays = dates.filter((d) => logDates.has(d)).length;
  const endDate = dates[dates.length - 1];
  const ended = today > endDate;
  const pct = Math.round((filledDays / phase.days) * 100);
  const isActive = today >= phase.startDate && today <= endDate;
  const isArchived = !!onRestore;

  return (
    <div className="card overflow-hidden">
      <Link
        to={`/bedroom/${phase.id}`}
        style={{ display: 'block', padding: '16px', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: phase.color, borderRadius: '14px 14px 0 0' }} />
        <div className="flex items-start gap-3 mt-1">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: isArchived ? 'var(--line)' : phase.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {phase.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: isArchived ? 'var(--ink-faint)' : 'var(--ink)' }}>{phase.title}</span>
              {isActive && !isArchived && <span className="mono text-xs px-2 py-0.5 rounded-full" style={{ background: phase.colorSoft, color: phase.color }}>进行中</span>}
              {ended && pct === 100 && !isArchived && <span className="text-xs">🏆</span>}
              {isArchived && <span className="mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--line)', color: 'var(--ink-faint)' }}>已归档</span>}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{phase.subtitle}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>
              {formatDate(phase.startDate)} – {formatDate(endDate)}
            </span>
            <span className="mono text-xs font-bold" style={{ color: phase.color }}>
              {filledDays}/{phase.days} 天
            </span>
          </div>
          <div style={{ height: 5, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${phase.color})`, borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </Link>
      {(onArchive || onRestore) && (
        <div className="border-t flex" style={{ borderColor: 'var(--line)' }}>
          {onArchive && (
            <button onClick={onArchive} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs" style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <Archive size={13} /> 归档
            </button>
          )}
          {onRestore && (
            <button onClick={onRestore} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <RotateCcw size={13} /> 恢复
            </button>
          )}
        </div>
      )}
    </div>
  );
}
