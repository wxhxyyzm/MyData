export default function TrendChart({ logs, days = 14 }) {
  const dates = lastDays(days);
  const counts = dates.map((date) => logs.filter((log) => log.date === date).length);
  const max = Math.max(...counts, 1);
  const points = counts.map((count, index) => {
    const x = (index / (counts.length - 1)) * 100;
    const y = 46 - (count / max) * 38;
    return `${x},${y}`;
  });

  return (
    <div className="card p-5">
      <div className="display text-xl font-bold">14 天打卡趋势</div>
      <svg viewBox="0 0 100 52" className="mt-4 h-32 w-full overflow-visible">
        {[0, 1, 2].map((line) => <line key={line} x1="0" x2="100" y1={8 + line * 18} y2={8 + line * 18} stroke="var(--line)" strokeWidth="0.7" />)}
        <polygon points={`0,52 ${points.join(' ')} 100,52`} fill="color-mix(in srgb, var(--accent), transparent 82%)" />
        <polyline points={points.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => {
          const [cx, cy] = point.split(',');
          return <circle key={point} cx={cx} cy={cy} r="2.5" fill="var(--accent)" />;
        })}
      </svg>
    </div>
  );
}

function lastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
}
