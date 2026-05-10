import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingScreen from '../../../components/LoadingScreen';
import { Check, Plus, Trash2 } from '../../../icons';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { deleteTodo, insertTodo, loadTodos, updateTodo } from '../api';

export default function ListView({ lists }) {
  const { listId } = useParams();
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const list = lists.find((l) => l.id === listId);

  useEffect(() => {
    setLoading(true);
    loadTodos(listId).then(setTodos).finally(() => setLoading(false));
  }, [listId]);

  if (loading) return <LoadingScreen />;

  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const handleAdd = async () => {
    const t = text.trim();
    if (!t || !isOwner) return;
    setText('');
    const todo = await insertTodo(listId, t);
    setTodos((prev) => [...prev, todo]);
  };

  const handleToggle = async (todo) => {
    if (!isOwner) return;
    const patch = { done: !todo.done };
    await updateTodo(todo.id, patch);
    setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, ...patch } : t));
  };

  const handleDelete = async (id) => {
    if (!isOwner) return;
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="animate-in pb-6">
      <div className="card p-4 mb-4" style={{ background: 'var(--accent-soft)', border: '1.5px solid var(--line)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 28 }}>{list?.emoji || '📋'}</span>
          <div>
            <div className="font-bold text-base">{list?.title || '清单'}</div>
            <div className="mono text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
              {pending.length} 项待完成 · {done.length} 项已完成
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="card flex items-center gap-2 p-3 mb-4">
          <input
            ref={inputRef}
            className="flex-1"
            placeholder="添加事项..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)' }}
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            style={{ background: text.trim() ? 'var(--accent)' : 'var(--line)', border: 'none', borderRadius: 8, color: text.trim() ? 'white' : 'var(--ink-faint)', cursor: text.trim() ? 'pointer' : 'default', padding: '6px 12px', fontSize: 13, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s ease' }}
          >
            <Plus size={14} /> 添加
          </button>
        </div>
      )}

      {pending.length === 0 && done.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--ink-faint)' }}>还没有事项，添加第一条吧</div>
      )}

      {pending.length > 0 && (
        <div className="card overflow-hidden mb-4">
          {pending.map((todo, i) => (
            <TodoRow key={todo.id} todo={todo} isLast={i === pending.length - 1} onToggle={handleToggle} onDelete={isOwner ? handleDelete : null} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <details open={pending.length === 0}>
          <summary className="mono text-xs cursor-pointer py-1 mb-2" style={{ color: 'var(--ink-faint)', listStyle: 'none' }}>
            ▸ 已完成 · {done.length}
          </summary>
          <div className="card overflow-hidden">
            {done.map((todo, i) => (
              <TodoRow key={todo.id} todo={todo} isLast={i === done.length - 1} onToggle={handleToggle} onDelete={isOwner ? handleDelete : null} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TodoRow({ todo, isLast, onToggle, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 2000); return; }
    onDelete(todo.id);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <button type="button" onClick={() => onToggle(todo)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${todo.done ? 'var(--accent)' : 'var(--line)'}`, background: todo.done ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}>
        {todo.done && <Check size={13} style={{ color: 'white' }} />}
      </button>
      <span className="flex-1 text-sm" style={{ color: todo.done ? 'var(--ink-faint)' : 'var(--ink)', textDecoration: todo.done ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      {onDelete && (
        <button onClick={handleDelete} title={confirming ? '再点确认' : '删除'}
          style={{ background: confirming ? 'var(--accent)' : 'none', border: 'none', borderRadius: 6, color: confirming ? 'white' : 'var(--ink-faint)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
