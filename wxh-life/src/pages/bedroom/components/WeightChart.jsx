export default function WeightChart({ data }) {
  if (data.length < 2) return <div className="mono mt-4 text-[11px]" style={{ color: 'var(--ink-faint)' }}>体重数据不足</div>;
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 44 - ((item.value - min) / Math.max(max - min, 1)) * 36;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 52" className="mt-4 h-28 w-full overflow-visible">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.split(' ').map((point) => {
        const [cx, cy] = point.split(',');
        return <circle key={point} cx={cx} cy={cy} r="2.4" fill="var(--accent)" />;
      })}
    </svg>
  );
}
