import { getCalorieStatus, getCalorieTarget, getExercisePlan } from '../plans';

export default function OverviewTab({ phase, dates, logMap, onSelectDate }) {
  const weeks = [];
  for (let index = 0; index < dates.length; index += 7) weeks.push(dates.slice(index, index + 7));

  return (
    <section className="mt-4 space-y-4">
      <div className="card p-5">
        <div className="display text-xl font-bold">目标</div>
        <div className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{phase.targets}</div>
      </div>
      <div className="card p-5">
        <div className="display text-xl font-bold">热量安排</div>
        <div className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{phase.weeklyCalories}</div>
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={week.join('-')} className="card p-4">
          <div className="mono mb-3 text-[11px]" style={{ color: 'var(--ink-faint)' }}>Week {weekIndex + 1}</div>
          <div className="grid grid-cols-7 gap-2">
            {week.map((date) => {
              const status = getCalorieStatus(logMap[date]?.calories, getCalorieTarget(date));
              return (
                <button key={date} className="h-10 rounded-xl text-[11px]" onClick={() => onSelectDate(date)} style={{ background: colorFor(status, !!logMap[date]), color: status ? 'white' : 'var(--ink-faint)' }}>
                  {date.slice(8)}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {week.map((date) => <div key={date} className="text-xs" style={{ color: 'var(--ink-soft)' }}>{date.slice(5)} · {getExercisePlan(date).type}</div>)}
          </div>
        </div>
      ))}
    </section>
  );
}

function colorFor(status, logged) {
  if (!logged) return 'var(--line)';
  if (status === 'over') return '#ef4444';
  if (status === 'under') return '#eab308';
  return 'var(--accent)';
}
