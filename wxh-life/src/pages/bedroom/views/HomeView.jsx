import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorScreen from '../../../components/ErrorScreen';
import LoadingScreen from '../../../components/LoadingScreen';
import { loadAllLogs } from '../api';
import { PHASES, phaseDates } from '../plans';

export default function HomeView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllLogs().then(setLogs).catch(setError).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="卧室加载失败" message={error.message} />;

  const logDates = new Set(logs.map((log) => log.date));
  return (
    <main className="mx-auto max-w-3xl p-5">
      <div className="mb-5">
        <div className="display text-3xl font-bold">健康阶段</div>
        <div className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>起床、体重、热量、运动、睡眠等身体数据记录。</div>
      </div>
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const dates = phaseDates(phase);
          const done = dates.filter((date) => logDates.has(date)).length;
          return (
            <Link key={phase.id} to={`/bedroom/${phase.id}`} className="card block p-5 transition active:scale-[0.98]">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{phase.emoji}</div>
                <div className="flex-1">
                  <div className="display text-2xl font-bold">{phase.title}</div>
                  <div className="mono mt-1 text-[11px]" style={{ color: 'var(--ink-faint)' }}>{phase.subtitle} · {phase.startDate}</div>
                  <div className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{phase.goal}</div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((done / dates.length) * 100)}%`, background: 'var(--accent)' }} />
                  </div>
                  <div className="mono mt-2 text-[11px]" style={{ color: 'var(--ink-faint)' }}>{done}/{dates.length} 天已记录</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
