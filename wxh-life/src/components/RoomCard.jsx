import { Link } from 'react-router-dom';
import { ArrowRight } from '../icons';

export default function RoomCard({
  name,
  subtitle,
  emoji,
  color,
  colorSoft,
  description,
  path,
  preview,
  icon: Icon,
  status,
  metrics = [],
}) {
  return (
    <Link
      to={path}
      className="group relative block min-h-[232px] overflow-hidden p-5 transition duration-200 ease-out hover:-translate-y-1 active:-translate-y-0.5 sm:p-6"
      style={{
        borderRadius: 22,
        background: `linear-gradient(145deg, ${colorSoft}55, ${colorSoft}dd)`,
        border: '1px solid color-mix(in srgb, var(--bg-card), var(--line) 48%)',
        boxShadow: '0 18px 44px color-mix(in srgb, var(--ink), transparent 91%)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="flex h-full min-h-[184px] flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center text-[27px] shadow-sm"
            style={{ background: color, borderRadius: 16, color: 'white' }}
          >
            {Icon ? <Icon size={27} strokeWidth={2.2} /> : emoji}
          </div>
          <div className="mono rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.10em]" style={{ background: 'rgba(255,255,255,0.48)', color: 'var(--ink-soft)' }}>
            {status}
          </div>
        </div>
        <div>
          <div className="display text-[25px] font-extrabold leading-tight" style={{ color: 'var(--ink)' }}>{name}</div>
          <div className="mono mt-1 text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--ink-soft)' }}>
            {subtitle}
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-6" style={{ color: 'var(--ink-soft)' }}>{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {metrics.map((item) => (
            <div key={item.label} className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.42)' }}>
              <div className="mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--ink-faint)' }}>{item.label}</div>
              <div className="mt-1 text-[13px] font-bold" style={{ color: 'var(--ink)' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
            {preview === undefined ? (
              <div className="h-3 w-28 rounded opacity-60" style={{ background: 'var(--line)' }} />
            ) : preview === null ? (
              <div className="h-3" />
            ) : (
              preview
            )}
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full transition group-hover:translate-x-0.5" style={{ background: 'rgba(255,255,255,0.55)', color: 'var(--ink)' }}>
            <ArrowRight size={17} />
          </div>
        </div>
      </div>
    </Link>
  );
}
