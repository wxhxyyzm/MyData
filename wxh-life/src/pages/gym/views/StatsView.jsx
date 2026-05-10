import StatCard from '../components/StatCard';

export default function StatsView({ entries, stats }) {
  const moodCounts = countBy(entries, (entry) => entry.mood || entry.extras?.mood);
  const locationCounts = countBy(entries, (entry) => entry.location || entry.extras?.location || entry.extras?.customLocation);
  const currentStreak = calcCurrentStreak(entries);
  const bestStreak = calcBestStreak(entries);
  const avgDifficulty = average(entries.map((entry) => entry.difficulty || entry.extras?.difficulty));
  const exerciseStats = getExerciseStats(entries);
  const cardioPct = stats.total ? (stats.cardio / stats.total) * 100 : 0;

  return (
    <section className="animate-in">
      <div className="mb-4 px-1">
        <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
          {entries.length ? `${entries[entries.length - 1]?.date || ''} — ${entries[0]?.date || ''}` : 'No data yet'}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="累计训练" value={stats.total} hint="次" accent />
        <StatCard label="活跃天数" value={stats.activeDays} />
        <StatCard label="当前连续" value={currentStreak} hint="天" accent />
        <StatCard label="最长记录" value={bestStreak} hint="天" />
      </div>

      <div className="card mb-5 p-5">
        <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>有氧 / 无氧比例</div>
        <div style={{ height: 10, background: 'var(--line)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${cardioPct}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
          <div style={{ flex: 1, background: 'var(--accent-2)' }} />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ color: 'var(--ink-soft)' }}>有氧</span>
            <span className="mono font-semibold">{stats.cardio}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="mono font-semibold">{stats.strength}</span>
            <span style={{ color: 'var(--ink-soft)' }}>无氧</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)' }} />
          </span>
        </div>
      </div>

      <div className="card mb-5 p-5">
        <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>30-day heatmap</div>
        <div className="mt-4 grid grid-cols-10 gap-1">
          {lastDays(30).map((date) => {
            const active = entries.some((entry) => entry.date === date);
            return <div key={date} className="h-6 rounded" title={date} style={{ background: active ? 'var(--accent)' : 'var(--line)' }} />;
          })}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Breakdown title="心情分布" items={moodCounts} compact />
        <div className="card p-4">
          <div className="mono mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>平均难度</div>
          <div className="display mb-1 text-3xl font-bold" style={{ color: 'var(--accent)' }}>
            {avgDifficulty || '-'}<span className="text-sm font-normal" style={{ color: 'var(--ink-soft)' }}>/5</span>
          </div>
          <div style={{ fontSize: 16, letterSpacing: 2 }}>{stars(avgDifficulty)}</div>
        </div>
      </div>

      <Breakdown title="场地分布" items={locationCounts} />

      <div className="card mt-5 p-5">
        <div className="mono mb-4 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>训练项目排行</div>
        <div className="space-y-4">
          {exerciseStats.length === 0 && <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>暂无数据</div>}
          {exerciseStats.map((exercise) => {
            const pct = exerciseStats[0]?.count ? (exercise.count / exerciseStats[0].count) * 100 : 0;
            return (
              <div key={exercise.name}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{exercise.emoji}</span>
                    <span className="text-sm font-semibold">{exercise.name}</span>
                    <span className="mono rounded px-1.5 py-0.5 text-xs" style={{ background: exercise.type === 'cardio' ? 'var(--accent-soft)' : 'var(--accent-2-soft)', color: 'var(--ink)' }}>
                      {exercise.type === 'cardio' ? '有氧' : '无氧'}
                    </span>
                  </div>
                  <span className="display text-lg font-bold">{exercise.count}<span className="ml-0.5 text-xs font-normal" style={{ color: 'var(--ink-soft)' }}>次</span></span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: exercise.type === 'cardio' ? 'var(--accent)' : 'var(--accent-2)', transition: 'width 0.4s ease' }} />
                </div>
                <div className="mono mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
                  {exercise.type === 'cardio' ? (
                    <>
                      <span>⏱ 共 {exercise.duration} 分钟</span>
                      {exercise.calories > 0 && <span>🔥 {exercise.calories} kcal</span>}
                    </>
                  ) : (
                    <>
                      <span>共 {exercise.totalSets} 组</span>
                      <span>{exercise.totalReps} 次</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Breakdown({ title, items, compact = false }) {
  return (
    <div className={`card ${compact ? 'p-4' : 'p-5'}`}>
      <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>{title}</div>
      <div className="space-y-2">
        {Object.keys(items).length === 0 && <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>暂无数据</div>}
        {Object.entries(items).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span>{key}</span>
              <span className="mono text-xs font-semibold">{value}</span>
            </div>
            <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${value * 20}%`, maxWidth: '100%', background: 'var(--accent)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function lastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
}

function average(values) {
  const nums = values.map(Number).filter((value) => !Number.isNaN(value) && value > 0);
  if (!nums.length) return null;
  return (nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(1);
}

function stars(value) {
  const rounded = Math.round(Number(value) || 0);
  return Array.from({ length: 5 }, (_, index) => <span key={index} style={{ color: index < rounded ? 'var(--accent)' : 'var(--line)' }}>★</span>);
}

function getExerciseStats(entries) {
  const byName = {};
  entries.forEach((entry) => {
    if (!entry.name) return;
    if (!byName[entry.name]) {
      byName[entry.name] = {
        name: entry.name,
        emoji: entry.emoji,
        type: entry.type,
        count: 0,
        duration: 0,
        calories: 0,
        totalSets: 0,
        totalReps: 0,
      };
    }
    const item = byName[entry.name];
    item.count += 1;
    if (entry.type === 'cardio') {
      item.duration += Number(entry.duration) || 0;
      item.calories += Number(entry.calories) || 0;
    } else {
      item.totalSets += Number(entry.sets) || 0;
      item.totalReps += (Number(entry.sets) || 0) * (Number(entry.reps) || 0);
    }
  });
  return Object.values(byName).sort((a, b) => b.count - a.count);
}

function calcCurrentStreak(entries) {
  const dates = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date();
  while (dates.has(formatDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calcBestStreak(entries) {
  const sorted = Array.from(new Set(entries.map((entry) => entry.date))).sort();
  let best = 0;
  let current = 0;
  let previous = null;
  sorted.forEach((date) => {
    if (!previous || daysBetween(previous, date) === 1) current += 1;
    else current = 1;
    best = Math.max(best, current);
    previous = date;
  });
  return best;
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);
}
