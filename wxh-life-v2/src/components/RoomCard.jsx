import { Link } from 'react-router-dom';

export default function RoomCard({ name, subtitle, desc, emoji, color, colorSoft, path, preview }) {
  return (
    <Link
      to={path}
      className="card block"
      style={{ padding: 20, textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
    >
      {/* Top accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
        {/* Emoji badge */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: colorSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display font-bold" style={{ fontSize: 20, color: 'var(--ink)', lineHeight: 1.2 }}>{name}</div>
          {desc ? (
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{desc}</div>
          ) : (
            <div className="mono text-xs mt-0.5 uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>{subtitle}</div>
          )}
          <div className="mono text-xs mt-2" style={{ color: 'var(--ink-soft)', minHeight: 16 }}>
            {preview === undefined ? (
              <div style={{ height: 12, width: '60%', background: 'var(--line)', borderRadius: 4, opacity: 0.6 }} />
            ) : preview === null ? (
              <div style={{ height: 12 }} />
            ) : (
              preview
            )}
          </div>
        </div>

        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: colorSoft, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
        }}>
          →
        </div>
      </div>
    </Link>
  );
}
