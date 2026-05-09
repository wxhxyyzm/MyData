export default function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className="card p-5">
      <div className="mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>{label}</div>
      <div className="display mt-2 text-3xl font-bold" style={{ color: accent ? 'var(--accent)' : 'var(--ink)' }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>{hint}</div>}
    </div>
  );
}
