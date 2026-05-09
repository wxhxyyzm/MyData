export default function WeightChart({ data }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 300;
  const H = 60;
  const pad = { left: 28, right: 6, top: 6, bottom: 4 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const pts = data.map((d, i) => [
    pad.left + (i / (data.length - 1)) * iW,
    pad.top + (1 - (d.value - min) / range) * iH,
  ]);

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 60, display: 'block', marginTop: 12 }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x={pad.left - 3} y={pad.top + 5} textAnchor="end" fontSize="8" fill="var(--ink-faint)">{max.toFixed(1)}</text>
      <text x={pad.left - 3} y={H - pad.bottom} textAnchor="end" fontSize="8" fill="var(--ink-faint)">{min.toFixed(1)}</text>
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H} stroke="var(--line)" strokeWidth="0.5" />
      <path d={area} fill="url(#wg)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="2.5" fill="var(--accent)" opacity="0.6" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="var(--accent)" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}
