import { useEffect, useRef, useState } from 'react';

export default function EmojiPicker({ value, onChange, palette, size = 50 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          border: `1.5px solid ${open ? 'var(--accent)' : 'var(--line)'}`,
          background: 'var(--bg-card)',
          fontSize: 26,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        title="换个 emoji"
      >
        {value || '🙂'}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: size + 8,
            left: 0,
            zIndex: 50,
            width: 280,
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 10,
            boxShadow: '0 8px 24px rgba(42, 36, 28, 0.12)',
            animation: 'slide-in 0.18s ease-out',
          }}
        >
          <div className="text-xs mono mb-2" style={{ color: 'var(--ink-faint)' }}>挑一个 emoji</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
            {palette.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onChange(emoji); setOpen(false); }}
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  width: '100%',
                  aspectRatio: '1',
                  background: value === emoji ? 'var(--accent-soft)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.1s ease',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
