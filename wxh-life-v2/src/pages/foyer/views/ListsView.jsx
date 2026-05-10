import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Trash2, X } from '../../../icons';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { deleteList, insertList } from '../api';
import { LIST_EMOJIS } from '../presets';

export default function ListsView({ lists, setLists, counts }) {
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = async (data) => {
    if (!isOwner) { showToast('只读模式'); return; }
    const list = await insertList(data);
    setLists((prev) => [...prev, list]);
    setAddOpen(false);
    showToast('清单已创建 ✓');
  };

  const handleDelete = async (id) => {
    if (!isOwner) return;
    await deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    showToast('已删除');
  };

  const pinned = lists.filter((l) => l.is_pinned);
  const custom = lists.filter((l) => !l.is_pinned);

  return (
    <div className="animate-in pb-4">
      {isOwner && (
        <button className="btn-primary mb-5 w-full" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> 新建清单
        </button>
      )}

      {pinned.length > 0 && (
        <div className="mb-5">
          <div className="mono text-xs mb-2 px-1" style={{ color: 'var(--ink-faint)' }}>常驻清单</div>
          <div className="space-y-3">
            {pinned.map((list) => <ListCard key={list.id} list={list} counts={counts[list.id]} />)}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div>
          <div className="mono text-xs mb-2 px-1" style={{ color: 'var(--ink-faint)' }}>我的清单</div>
          <div className="space-y-3">
            {custom.map((list) => <ListCard key={list.id} list={list} counts={counts[list.id]} onDelete={isOwner ? handleDelete : null} />)}
          </div>
        </div>
      )}

      {lists.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📋</div>
          <div className="display text-lg font-semibold">待办清单</div>
          <div className="mt-2 text-xs leading-6" style={{ color: 'var(--ink-faint)' }}>新建清单，管理你的购物、待办、出行计划。</div>
        </div>
      )}

      {addOpen && <AddListModal onConfirm={handleAdd} onCancel={() => setAddOpen(false)} />}
    </div>
  );
}

function ListCard({ list, counts, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const total = counts?.total || 0;
  const done = counts?.done || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const handleDelete = (e) => {
    e.preventDefault();
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 2000); return; }
    onDelete(list.id);
  };

  return (
    <div className="card overflow-hidden">
      <Link to={`/foyer/list/${list.id}`} style={{ display: 'block', padding: '14px 16px', textDecoration: 'none' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {list.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-semibold text-sm">{list.title}</div>
            <div className="mono text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
              {total === 0 ? '还没有事项' : `${done}/${total} 已完成`}
            </div>
          </div>
          {onDelete && (
            <button onClick={handleDelete} title={confirming ? '再点确认删除' : '删除清单'}
              style={{ background: confirming ? 'var(--accent)' : 'none', border: 'none', borderRadius: 6, color: confirming ? 'white' : 'var(--ink-faint)', cursor: 'pointer', padding: 6, flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
        {total > 0 && (
          <div className="mt-3" style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : 'var(--accent)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        )}
      </Link>
    </div>
  );
}

function AddListModal({ onConfirm, onCancel }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📋');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 sm:items-center" onClick={onCancel}>
      <div className="card w-full max-w-md p-5 animate-in" style={{ boxShadow: '0 20px 70px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="display text-lg font-bold">新建清单</div>
          <button className="btn-ghost min-h-0 rounded-full p-2" onClick={onCancel}><X size={15} /></button>
        </div>

        <div className="mb-4">
          <span className="mono text-xs uppercase tracking-widest block mb-2" style={{ color: 'var(--ink-faint)' }}>选个图标</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {LIST_EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                style={{ fontSize: 22, padding: 6, border: `1.5px solid ${emoji === e ? 'var(--accent)' : 'transparent'}`, borderRadius: 8, background: emoji === e ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <label className="block mb-5">
          <span className="mono text-xs uppercase tracking-widest block mb-1.5" style={{ color: 'var(--ink-faint)' }}>清单名称</span>
          <input className="input" placeholder="例如：旅游清单、工作任务..." value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onConfirm({ title: title.trim(), emoji }); }} />
        </label>

        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onCancel}>取消</button>
          <button className="btn-primary flex-[2]" disabled={!title.trim()} onClick={() => onConfirm({ title: title.trim(), emoji })}>
            <Check size={15} /> 创建
          </button>
        </div>
      </div>
    </div>
  );
}
