import WeightChart from '../components/WeightChart';
import { todayStr } from '../../../lib/utils';

export default function StatsTab({ logs, dates }) {
  const filledLogs = logs.filter((log) => log.data);
  const today = todayStr();
  const pastDates = dates.filter((d) => d <= today);

  // Weight
  const weightEntries = filledLogs
    .filter((log) => log.data.weight)
    .map((log) => ({ date: log.date, value: Number(log.data.weight) }))
    .filter((e) => !Number.isNaN(e.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  const firstWeight = weightEntries[0]?.value;
  const lastWeight = weightEntries.at(-1)?.value;
  const weightChange = firstWeight != null && lastWeight != null ? (lastWeight - firstWeight).toFixed(1) : null;
  const last7w = weightEntries.slice(-7);
  const avg7w = last7w.length > 0 ? (last7w.reduce((s, e) => s + e.value, 0) / last7w.length).toFixed(1) : null;

  // Calories & exercise
  const avgCalories = average(filledLogs.map((log) => log.data.calories));
  const avgExercise = average(filledLogs.map((log) => log.data.exercise?.calories));

  // Medication
  const vitDCount = filledLogs.filter((log) => log.data.vitD).length;
  const ironCount = filledLogs.filter((log) => log.data.iron).length;
  const probioticsCount = filledLogs.filter((log) => log.data.probiotics).length;
  const seleniumCount = filledLogs.filter((log) => log.data.selenium).length;

  // Body signals
  const bowelNormal = filledLogs.filter((log) => log.data.bowel === '正常').length;
  const bowelHard = filledLogs.filter((log) => log.data.bowel === '费力').length;
  const bowelNone = filledLogs.filter((log) => log.data.bowel === '无').length;
  const hungerVals = filledLogs.filter((log) => log.data.hunger).map((log) => log.data.hunger);
  const fatigueVals = filledLogs.filter((log) => log.data.fatigue).map((log) => log.data.fatigue);
  const avgHunger = hungerVals.length ? (hungerVals.reduce((a, b) => a + b, 0) / hungerVals.length).toFixed(1) : '–';
  const avgFatigue = fatigueVals.length ? (fatigueVals.reduce((a, b) => a + b, 0) / fatigueVals.length).toFixed(1) : '–';

  const checkinRate = pastDates.length ? Math.round((filledLogs.length / pastDates.length) * 100) : 0;

  if (filledLogs.length === 0) {
    return (
      <div className="px-5 py-20 text-center animate-in">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div className="display text-lg font-semibold mb-2">还没有数据</div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>去「每日打卡」记录几天再来看统计</div>
      </div>
    );
  }

  return (
    <div className="px-5 animate-in" style={{ paddingTop: 12, paddingBottom: 16 }}>
      <div className="text-center mt-3 mb-4">
        <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>已记录 {filledLogs.length} 天</div>
      </div>

      {/* Weight card */}
      <div className="card p-4 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-3" style={{ color: 'var(--ink-faint)' }}>体重变化</div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>起始</div>
            <div className="display text-2xl font-bold">{firstWeight ?? '–'}<span className="text-sm ml-1">斤</span></div>
          </div>
          <div className="text-center">
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>变化</div>
            <div className="display text-2xl font-bold" style={{ color: weightChange != null && parseFloat(weightChange) < 0 ? 'var(--accent)' : weightChange != null && parseFloat(weightChange) > 0 ? '#ef4444' : 'var(--ink)' }}>
              {weightChange != null ? (parseFloat(weightChange) > 0 ? '+' : '') + weightChange : '–'}<span className="text-sm ml-1">斤</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>最新</div>
            <div className="display text-2xl font-bold">{lastWeight ?? '–'}<span className="text-sm ml-1">斤</span></div>
          </div>
        </div>
        {avg7w && (
          <div className="mt-3 p-2 rounded-lg text-center" style={{ background: 'var(--accent-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>7日平均: </span>
            <span className="mono text-sm font-bold" style={{ color: 'var(--accent)' }}>{avg7w} kg</span>
          </div>
        )}
        {weightEntries.length >= 2 && (
          <div style={{ marginTop: 12, height: 80, position: 'relative' }}>
            <WeightChart data={weightEntries} />
          </div>
        )}
      </div>

      {/* Calorie & exercise row */}
      <div className="flex gap-3 mb-3">
        <div className="card p-4 flex-1">
          <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>日均摄入</div>
          <div className="display text-xl font-bold mt-1" style={{ color: avgCalories && avgCalories > 1400 ? '#ef4444' : 'var(--ink)' }}>
            {avgCalories ?? '–'}<span className="text-xs ml-1">kcal</span>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>日均消耗</div>
          <div className="display text-xl font-bold mt-1" style={{ color: 'var(--accent)' }}>
            {avgExercise ?? '–'}<span className="text-xs ml-1">kcal</span>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-3">
        <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>打卡率</div>
        <div className="display text-xl font-bold mt-1" style={{ color: 'var(--accent)' }}>
          {checkinRate}<span className="text-xs ml-1">%</span>
        </div>
      </div>

      {/* Medication */}
      <div className="card p-4 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>吃药记录</div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
          {[['维生素D', vitDCount], ['铁剂', ironCount], ['益生菌', probioticsCount], ['硒', seleniumCount]].map(([label, count]) => (
            <div key={label}>
              <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>{label} </span>
              <span className="mono text-sm font-bold" style={{ color: 'var(--accent)' }}>{count}/{filledLogs.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body signals */}
      <div className="card p-4 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>身体信号</div>
        <div className="flex gap-4 mb-2">
          <div><span className="text-xs" style={{ color: 'var(--ink-faint)' }}>平均饥饿感 </span><span className="mono text-sm font-bold">{avgHunger}</span></div>
          <div><span className="text-xs" style={{ color: 'var(--ink-faint)' }}>平均疲劳感 </span><span className="mono text-sm font-bold">{avgFatigue}</span></div>
        </div>
        <div className="flex gap-3 text-xs">
          <span style={{ color: 'var(--accent)' }}>排便正常 {bowelNormal}</span>
          <span style={{ color: '#eab308' }}>费力 {bowelHard}</span>
          <span style={{ color: '#ef4444' }}>无 {bowelNone}</span>
        </div>
      </div>
    </div>
  );
}

function average(values) {
  const nums = values.map(Number).filter((v) => !Number.isNaN(v) && v > 0);
  if (!nums.length) return null;
  return Math.round(nums.reduce((sum, v) => sum + v, 0) / nums.length);
}
