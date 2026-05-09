import { useMemo, useState } from 'react';
import { DEFAULT_LOCATION_PRESETS, MOOD_OPTIONS } from '../presets';
import StatCard from '../components/StatCard';

export default function StatsView({ entries, stats, custom }) {
  const [sortBy, setSortBy] = useState('count');

  const computed = useMemo(() => {
    const totalCalories = entries.reduce((s, e) => s + (e.calories || 0), 0);
    const dates = entries.map((e) => e.date).sort();
    const firstDate = dates[0];
    const spanDays = firstDate ? daysBetween(firstDate, todayStr()) + 1 : 0;

    // Per-exercise breakdown
    const byName = {};
    entries.forEach((e) => {
      if (!byName[e.name]) {
        byName[e.name] = { name: e.name, emoji: e.emoji, type: e.type, count: 0, duration: 0, calories: 0, totalSets: 0, totalReps: 0, lastDate: e.date };
      }
      const item = byName[e.name];
      item.count++;
      if (e.type === 'cardio') {
        item.duration += e.duration || 0;
        item.calories += e.calories || 0;
      } else {
        item.totalSets += e.sets || 0;
        item.totalReps += (e.sets || 0) * (e.reps || 0);
      }
      if (e.date > item.lastDate) item.lastDate = e.date;
    });
    let exerciseList = Object.values(byName);
    if (sortBy === 'count') exerciseList.sort((a, b) => b.count - a.count);
    else if (sortBy === 'duration') exerciseList.sort((a, b) => (b.duration + b.totalReps * 0.1) - (a.duration + a.totalReps * 0.1));
    else exerciseList.sort((a, b) => b.lastDate.localeCompare(a.lastDate));

    // Streak
    let streak = 0;
    const allDates = new Set(entries.map((e) => e.date));
    let checkDate = new Date(todayStr());
    if (!allDates.has(todayStr())) checkDate.setDate(checkDate.getDate() - 1);
    while (allDates.has(isoDate(checkDate))) { streak++; checkDate.setDate(checkDate.getDate() - 1); }

    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...allDates].sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || daysBetween(sortedDates[i - 1], sortedDates[i]) === 1) tempStreak++;
      else tempStreak = 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // 30-day heatmap
    const today = new Date(todayStr());
    const heatmap = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = isoDate(d);
      heatmap.push({ date: dStr, count: entries.filter((e) => e.date === dStr).length });
    }

    // Mood breakdown
    const moodCounts = {};
    entries.forEach((e) => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
    const moodBreakdown = Object.entries(moodCounts)
      .map(([key, count]) => ({ ...MOOD_OPTIONS.find((m) => m.key === key), count }))
      .filter((m) => m.key)
      .sort((a, b) => b.count - a.count);
    const totalMoodLogs = moodBreakdown.reduce((s, m) => s + m.count, 0);

    // Location breakdown
    const allKnownLocs = [...DEFAULT_LOCATION_PRESETS, ...(custom?.locations || [])];
    const locCounts = {};
    const locMeta = {};
    entries.forEach((e) => {
      if (e.location === 'custom' && e.customLocation) {
        const k = `custom:${e.customLocation}`;
        locCounts[k] = (locCounts[k] || 0) + 1;
        locMeta[k] = { emoji: '📍', label: e.customLocation };
      } else if (e.location && e.location !== 'custom') {
        locCounts[e.location] = (locCounts[e.location] || 0) + 1;
        if (!locMeta[e.location]) {
          const preset = allKnownLocs.find((l) => l.key === e.location);
          locMeta[e.location] = preset ? { emoji: preset.emoji, label: preset.label } : { emoji: '📍', label: '未知场地' };
        }
      }
    });
    const locBreakdown = Object.entries(locCounts)
      .map(([key, count]) => ({ key, ...locMeta[key], count }))
      .sort((a, b) => b.count - a.count);
    const totalLocLogs = locBreakdown.reduce((s, l) => s + l.count, 0);

    // Avg difficulty
    const difficultyEntries = entries.filter((e) => e.difficulty > 0);
    const avgDifficulty = difficultyEntries.length > 0
      ? difficultyEntries.reduce((s, e) => s + e.difficulty, 0) / difficultyEntries.length
      : 0;

    return { totalCalories, firstDate, spanDays, exerciseList, streak, longestStreak, heatmap, moodBreakdown, totalMoodLogs, locBreakdown, totalLocLogs, avgDifficulty, difficultyCount: difficultyEntries.length };
  }, [entries, sortBy, custom]);

  if (!entries.length) {
    return (
      <div className="animate-in">
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="display text-xl mb-1">还没有数据</div>
          <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>记录几次训练后再回来看统计吧</div>
        </div>
      </div>
    );
  }

  const cardioPct = stats.total ? (stats.cardio / stats.total) * 100 : 0;

  return (
    <div className="animate-in">
      {/* Date range */}
      <div className="mb-4 px-1">
        <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>All time · 全部记录</div>
        {computed.firstDate && (
          <div className="mono mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>
            {computed.firstDate} → {todayStr()} · 共 {computed.spanDays} 天
          </div>
        )}
      </div>

      {/* Hero stats 2×2 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="训练次数" value={stats.total} hint="次" accent />
        <StatCard label="活跃天数" value={stats.activeDays} hint="天" />
        <StatCard label="有氧时长" value={stats.cardioMinutes} hint="分钟" />
        <StatCard label="总卡路里" value={computed.totalCalories} hint="kcal" accent />
      </div>

      {/* Streak cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="card p-4" style={{ background: computed.streak > 0 ? 'var(--accent-soft)' : 'var(--bg-card)' }}>
          <div className="mb-1 flex items-center gap-1">
            <span className="text-lg">🔥</span>
            <span className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>当前连续</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="display text-3xl font-bold" style={{ color: computed.streak > 0 ? 'var(--accent)' : 'var(--ink)' }}>{computed.streak}</span>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>天</span>
          </div>
        </div>
        <div className="card p-4">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-lg">🏆</span>
            <span className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>最长记录</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="display text-3xl font-bold">{computed.longestStreak}</span>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>天</span>
          </div>
        </div>
      </div>

      {/* Cardio vs strength ratio */}
      <div className="card mb-5 p-5">
        <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>有氧 / 无氧比例</div>
        <div style={{ height: 10, background: 'var(--line)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${cardioPct}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
          <div style={{ flex: 1, background: 'var(--accent-2, #5a7a4e)' }} />
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
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2, #5a7a4e)' }} />
          </span>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="card mb-5 p-5">
        <div className="mb-3">
          <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>Recent 30 days</div>
          <div className="display text-lg font-semibold">近 30 天活跃度</div>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
          {computed.heatmap.map((d, i) => {
            const intensity = d.count === 0 ? 0 : Math.min(d.count / 3, 1);
            const bg = d.count === 0 ? 'var(--line)' : `rgba(217, 96, 59, ${0.3 + intensity * 0.7})`;
            return <div key={i} title={`${d.date}: ${d.count}次`} style={{ aspectRatio: '1', background: bg, borderRadius: 3 }} />;
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs" style={{ color: 'var(--ink-faint)' }}>
          <span>少</span>
          {[0.3, 0.55, 0.8, 1].map((a) => (
            <span key={a} style={{ width: 10, height: 10, background: `rgba(217, 96, 59, ${a})`, borderRadius: 2 }} />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* Mood & Difficulty */}
      {(computed.totalMoodLogs > 0 || computed.difficultyCount > 0) && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          {computed.totalMoodLogs > 0 && (
            <div className="card p-4">
              <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>心情分布</div>
              <div className="space-y-2">
                {computed.moodBreakdown.slice(0, 4).map((m) => {
                  const pct = (m.count / computed.totalMoodLogs) * 100;
                  return (
                    <div key={m.key}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm">
                          <span>{m.emoji}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{m.label}</span>
                        </span>
                        <span className="mono text-xs font-semibold">{m.count}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {computed.difficultyCount > 0 && (
            <div className="card p-4">
              <div className="mono mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>平均难度</div>
              <div className="display mb-1 text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                {computed.avgDifficulty.toFixed(1)}<span className="text-sm font-normal" style={{ color: 'var(--ink-soft)' }}>/5</span>
              </div>
              <div style={{ fontSize: 16, letterSpacing: 2 }}>{stars(computed.avgDifficulty)}</div>
            </div>
          )}
        </div>
      )}

      {/* Location breakdown */}
      {computed.locBreakdown.length > 0 && (
        <div className="card mb-5 p-5">
          <div className="mono mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>场地分布</div>
          <div className="space-y-2">
            {computed.locBreakdown.map((loc) => {
              const pct = (loc.count / computed.totalLocLogs) * 100;
              return (
                <div key={loc.key}>
                  <div className="mb-0.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span>{loc.emoji}</span>
                      <span style={{ color: 'var(--ink-soft)' }}>{loc.label}</span>
                    </span>
                    <span className="mono text-xs font-semibold">{loc.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise rankings */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>训练项目排行</div>
          <div className="flex gap-1">
            {[['count', '次数'], ['duration', '时长'], ['recent', '最近']].map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)} style={{ background: sortBy === key ? 'var(--accent-soft)' : 'none', border: 'none', borderRadius: 6, color: sortBy === key ? 'var(--accent)' : 'var(--ink-faint)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 8px' }}>{label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {computed.exerciseList.length === 0 && <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>暂无数据</div>}
          {computed.exerciseList.map((exercise) => {
            const pct = computed.exerciseList[0]?.count ? (exercise.count / computed.exerciseList[0].count) * 100 : 0;
            return (
              <div key={exercise.name}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{exercise.emoji}</span>
                    <span className="text-sm font-semibold">{exercise.name}</span>
                    <span className="mono rounded px-1.5 py-0.5 text-xs" style={{ background: exercise.type === 'cardio' ? 'var(--accent-soft)' : 'var(--accent-2-soft, #c9d8c0)', color: 'var(--ink)' }}>
                      {exercise.type === 'cardio' ? '有氧' : '无氧'}
                    </span>
                  </div>
                  <span className="display text-lg font-bold">{exercise.count}<span className="ml-0.5 text-xs font-normal" style={{ color: 'var(--ink-soft)' }}>次</span></span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: exercise.type === 'cardio' ? 'var(--accent)' : 'var(--accent-2, #5a7a4e)', transition: 'width 0.4s ease' }} />
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
    </div>
  );
}

function stars(value) {
  const rounded = Math.round(Number(value) || 0);
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} style={{ color: index < rounded ? 'var(--accent)' : 'var(--line)' }}>★</span>
  ));
}

function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);
}
