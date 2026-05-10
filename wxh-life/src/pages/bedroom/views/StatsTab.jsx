import WeightChart from '../components/WeightChart';

export default function StatsTab({ logs, dates }) {
  const weights = logs.filter((log) => log.data?.weight).map((log) => ({ date: log.date, value: Number(log.data.weight) })).reverse();
  const latestWeight = weights.at(-1)?.value;
  const firstWeight = weights[0]?.value;
  const avgCalories = average(logs.map((log) => log.data?.calories));
  const avgExercise = average(logs.map((log) => log.data?.exerciseCalories));

  return (
    <section className="mt-4 space-y-4">
      <div className="card p-5">
        <div className="display text-xl font-bold">体重变化</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat label="起始" value={firstWeight || '-'} />
          <Stat label="最新" value={latestWeight || '-'} />
          <Stat label="变化" value={firstWeight && latestWeight ? (latestWeight - firstWeight).toFixed(1) : '-'} />
        </div>
        <WeightChart data={weights} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="日均摄入" value={avgCalories || '-'} />
        <Stat label="日均消耗" value={avgExercise || '-'} />
        <Stat label="记录天数" value={logs.length} />
        <Stat label="打卡率" value={`${Math.round((logs.length / dates.length) * 100)}%`} />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return <div className="card p-4"><div className="mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>{label}</div><div className="display mt-2 text-2xl font-bold">{value}</div></div>;
}

function average(values) {
  const nums = values.map(Number).filter((value) => !Number.isNaN(value));
  if (!nums.length) return null;
  return Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length);
}
