export default function Heatmap({ logs, days = 90 }) {
  const counts = logs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + 1;
    return acc;
  }, {});
  const dates = lastDays(days);

  return (
    <div className="card p-5">
      <div className="display text-xl font-bold">90 天热力图</div>
      <div className="mt-4 grid grid-cols-10 gap-1">
        {dates.map((date) => {
          const count = counts[date] || 0;
          return (
            <div
              key={date}
              title={`${date} · ${count}`}
              className="h-6 rounded"
              style={{ background: heatColor(count), outline: date === todayStr() ? '1px solid var(--ink)' : 'none' }}
            />
          );
        })}
      </div>
      <div className="mono mt-3 flex items-center gap-2 text-[10px]" style={{ color: 'var(--ink-faint)' }}>
        <span>少</span>
        {[0, 1, 2, 3, 4].map((count) => <span key={count} className="h-4 w-4 rounded" style={{ background: heatColor(count) }} />)}
        <span>多</span>
      </div>
    </div>
  );
}

function heatColor(count) {
  if (count <= 0) return 'var(--line)';
  if (count === 1) return 'color-mix(in srgb, var(--accent), white 65%)';
  if (count === 2) return 'color-mix(in srgb, var(--accent), white 42%)';
  if (count === 3) return 'color-mix(in srgb, var(--accent), white 20%)';
  return 'var(--accent)';
}

function lastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
}

function todayStr() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
