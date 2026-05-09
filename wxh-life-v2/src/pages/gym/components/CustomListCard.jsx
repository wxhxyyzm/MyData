import { useState } from 'react';
import { X } from '../../../icons';

export default function CustomListCard({ title, items, empty, onChange }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="display text-base font-semibold">{title}</div>
        <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{items.length} 项</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs" style={{ color: 'var(--ink-faint)', lineHeight: 1.6 }}>{empty}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Chip
              key={`${item.name || item.label}-${index}`}
              item={item}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ item, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 2000);
      return;
    }
    onRemove();
  };

  return (
    <div
      className="flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full"
      style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}
    >
      <span>{item.emoji}</span>
      <span className="text-sm font-medium">{item.name || item.label}</span>
      <button
        type="button"
        onClick={handleClick}
        title={confirming ? '再点一次确认删除' : '删除'}
        style={{
          background: confirming ? 'var(--accent)' : 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: confirming ? 'white' : 'var(--ink-faint)',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
