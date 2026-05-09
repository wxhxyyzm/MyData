import { useState } from 'react';
import { Pencil, Trash2 } from '../../../icons';

export default function NoteCard({ note, item, onDelete, onResolve, onEdit }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 2000);
      return;
    }
    onDelete(note.id);
  };

  return (
    <div className="card p-4" style={{ borderLeft: `3px solid ${note.resolved ? '#16a34a' : '#dc2626'}` }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {item ? (
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              {item.moduleEmoji} <span style={{ color: item.moduleColor, fontWeight: 600 }}>{item.moduleTitle}</span>
              <span style={{ margin: '0 4px' }}>·</span>{item.title}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--ink-faint)' }}>{note.type === 'extra' ? '额外学习' : '独立难点'}</div>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {onEdit && <button onClick={() => onEdit(note)} style={iconButtonStyle} title="编辑"><Pencil size={14} /></button>}
          <button onClick={handleDelete} style={{ ...iconButtonStyle, background: confirming ? 'var(--accent)' : 'none', color: confirming ? 'white' : 'var(--ink-faint)', borderRadius: 6, padding: 4 }} title={confirming ? '再点一次确认删除' : '删除'}><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="text-sm leading-6" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
      {note.resolution && (
        <div className="mt-3 rounded-lg p-2 text-xs" style={{ background: '#f0fdf4', borderLeft: '2px solid #16a34a', color: '#15803d', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          ✅ {note.resolution}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{relativeDate(note.created_at)} 记录</div>
        {onResolve && <button onClick={() => onResolve(note)} style={{ background: note.resolved ? 'var(--bg)' : '#16a34a', border: note.resolved ? '1px solid var(--line)' : 'none', borderRadius: 999, color: note.resolved ? 'var(--ink-soft)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, padding: '4px 12px' }}>{note.resolved ? '重新打开' : '标记已解决'}</button>}
      </div>
    </div>
  );
}

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  borderRadius: 6,
  color: 'var(--ink-faint)',
  cursor: 'pointer',
  padding: 4,
};

function relativeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
