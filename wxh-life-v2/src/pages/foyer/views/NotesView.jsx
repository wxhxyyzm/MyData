import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from '../../../icons';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { genId, todayStr } from '../../../lib/utils';
import { deleteNote, insertNote, updateNote } from '../api';
import { MOODS, PRESET_TAGS } from '../presets';

export default function NotesView({ notes, setNotes }) {
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleAdd = async (data) => {
    if (!isOwner) { showToast('只读模式'); return; }
    const note = await insertNote(data);
    setNotes((prev) => [note, ...prev]);
    setAddOpen(false);
    showToast('已记录 ✓');
  };

  const handleEdit = async (patch) => {
    if (!isOwner || !editingNote) return;
    await updateNote(editingNote.id, patch);
    setNotes((prev) => prev.map((n) => n.id === editingNote.id ? { ...n, ...patch } : n));
    setEditingNote(null);
    showToast('已更新');
  };

  const handleDelete = async (id) => {
    if (!isOwner) return;
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const grouped = groupByDate(notes);

  return (
    <div className="animate-in pb-4">
      {isOwner && (
        <button className="btn-primary mb-5 w-full" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> 新建灵感
        </button>
      )}
      {notes.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">💡</div>
          <div className="display text-lg font-semibold">灵感记录</div>
          <div className="mt-2 text-xs leading-6" style={{ color: 'var(--ink-faint)' }}>记录你的想法、感悟、灵感，随时翻看。</div>
        </div>
      )}
      {grouped.map(({ date, items }) => (
        <div key={date} className="mb-5">
          <div className="mono text-xs mb-2 px-1" style={{ color: 'var(--ink-faint)' }}>{formatGroupDate(date)}</div>
          <div className="space-y-3">
            {items.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={isOwner ? setEditingNote : null} onDelete={isOwner ? handleDelete : null} />
            ))}
          </div>
        </div>
      ))}
      {addOpen && <NoteModal onConfirm={handleAdd} onCancel={() => setAddOpen(false)} />}
      {editingNote && <NoteModal initial={editingNote} onConfirm={handleEdit} onCancel={() => setEditingNote(null)} />}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const mood = MOODS.find((m) => m.key === note.mood);

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 2000); return; }
    onDelete(note.id);
  };

  return (
    <div className="card p-4" style={{ borderLeft: '3px solid var(--accent-soft)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {mood && <span title={mood.label}>{mood.emoji}</span>}
          {note.keyword && <span className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>{note.keyword}</span>}
          <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{note.date}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          {onEdit && <button onClick={() => onEdit(note)} style={iconBtn} title="编辑"><Pencil size={13} /></button>}
          {onDelete && (
            <button onClick={handleDelete} title={confirming ? '再点确认' : '删除'}
              style={{ ...iconBtn, background: confirming ? 'var(--accent)' : 'none', color: confirming ? 'white' : 'var(--ink-faint)', borderRadius: 6, padding: 4 }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="text-sm leading-6" style={{ whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>{note.content}</div>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.map((tag) => (
            <span key={tag} className="mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteModal({ initial, onConfirm, onCancel }) {
  const [content, setContent] = useState(initial?.content || '');
  const [date, setDate] = useState(initial?.date || todayStr());
  const [keyword, setKeyword] = useState(initial?.keyword || '');
  const [mood, setMood] = useState(initial?.mood || null);
  const [tags, setTags] = useState(initial?.tags || []);
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onConfirm({ content: content.trim(), date, keyword: keyword.trim() || null, mood, tags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 sm:items-center" onClick={onCancel}>
      <div className="card w-full max-w-md p-5 animate-in" style={{ boxShadow: '0 20px 70px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="display text-lg font-bold">{initial ? '编辑灵感' : '新建灵感'}</div>
          <button className="btn-ghost min-h-0 rounded-full p-2" onClick={onCancel}><X size={15} /></button>
        </div>

        <label className="block mb-4">
          <span className="mono text-xs uppercase tracking-widest block mb-1.5" style={{ color: 'var(--ink-faint)' }}>日期</span>
          <input className="input mono" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label className="block mb-4">
          <span className="mono text-xs uppercase tracking-widest block mb-1.5" style={{ color: 'var(--ink-faint)' }}>关键词 · 可选</span>
          <input className="input" placeholder="一个词或短语概括这条灵感" value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={20} />
        </label>

        <label className="block mb-4">
          <span className="mono text-xs uppercase tracking-widest block mb-1.5" style={{ color: 'var(--ink-faint)' }}>内容</span>
          <textarea className="input" rows={5} placeholder="写下你的想法、感悟、灵感..." value={content} onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'vertical', minHeight: 120, border: '1.5px solid var(--line)', borderRadius: 12, padding: '10px 12px' }} />
        </label>

        <div className="mb-4">
          <span className="mono text-xs uppercase tracking-widest block mb-2" style={{ color: 'var(--ink-faint)' }}>心情 · 可选</span>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button key={m.key} type="button" onClick={() => setMood(mood === m.key ? null : m.key)}
                className="flex flex-col items-center justify-center"
                style={{ width: 52, padding: '6px 4px', border: `1.5px solid ${mood === m.key ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 10, background: mood === m.key ? 'var(--accent-soft)' : 'var(--bg-card)', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, marginTop: 3, color: mood === m.key ? 'var(--accent)' : 'var(--ink-faint)' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <span className="mono text-xs uppercase tracking-widest block mb-2" style={{ color: 'var(--ink-faint)' }}>标签 · 可选</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className="mono text-xs px-2.5 py-1 rounded-full"
                style={{ background: tags.includes(tag) ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${tags.includes(tag) ? 'var(--accent)' : 'var(--line)'}`, color: tags.includes(tag) ? 'white' : 'var(--ink-soft)', cursor: 'pointer' }}>
                #{tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="自定义标签" value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }} />
            <button className="btn-ghost min-h-0 px-3" onClick={addCustomTag}>添加</button>
          </div>
          {tags.filter((t) => !PRESET_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.filter((t) => !PRESET_TAGS.includes(t)).map((tag) => (
                <span key={tag} onClick={() => toggleTag(tag)} className="mono text-xs px-2.5 py-1 rounded-full cursor-pointer"
                  style={{ background: 'var(--accent)', color: 'white' }}>#{tag} ×</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onCancel}>取消</button>
          <button className="btn-primary flex-[2]" disabled={!content.trim()} onClick={handleSubmit}>
            <Check size={15} /> {initial ? '保存修改' : '记录'}
          </button>
        </div>
      </div>
    </div>
  );
}

function groupByDate(notes) {
  const map = new Map();
  notes.forEach((note) => {
    if (!map.has(note.date)) map.set(note.date, []);
    map.get(note.date).push(note);
  });
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

function formatGroupDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const iconBtn = { background: 'none', border: 'none', borderRadius: 6, color: 'var(--ink-faint)', cursor: 'pointer', padding: 4 };
