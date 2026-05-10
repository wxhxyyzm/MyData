import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BottomTabBar from '../../../components/BottomTabBar';
import LoadingScreen from '../../../components/LoadingScreen';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Calendar, Check, Layers, Lightbulb, Sparkles, X } from '../../../icons';
import { genId, todayStr } from '../../../lib/utils';
import { deleteLog, deleteNote, insertLog, insertNote, loadLogs, loadNotes, updateNote, updateProject } from '../api';
import { getPlan } from '../plans';
import ExtraView from './ExtraView';
import HistoryView from './HistoryView';
import NotesView from './NotesView';
import PlanView from './PlanView';

export default function ProjectDetailView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'plan';
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [checkInItem, setCheckInItem] = useState(null);
  const [addNoteFor, setAddNoteFor] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const plan = getPlan(projectId);
  const doneItemIds = useMemo(() => new Set(logs.map((log) => log.item_id)), [logs]);
  const todayDoneIds = useMemo(() => new Set(logs.filter((log) => log.date === todayStr()).map((log) => log.item_id)), [logs]);
  const unresolvedCount = notes.filter((note) => note.type === 'note' && !note.resolved).length;
  const tabs = [
    { id: 'plan', Icon: Layers, label: '计划' },
    { id: 'notes', Icon: Lightbulb, label: '难点本', badge: unresolvedCount },
    { id: 'extra', Icon: Sparkles, label: '额外' },
    { id: 'history', Icon: Calendar, label: '记录' },
  ];

  useEffect(() => {
    Promise.all([loadLogs(projectId), loadNotes(projectId)])
      .then(([logData, noteData]) => {
        setLogs(logData);
        setNotes(noteData);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <LoadingScreen />;

  const requireOwner = () => {
    if (isOwner) return true;
    showToast('只读模式，请先登录');
    return false;
  };

  const addCheckin = async (item, payload) => {
    if (!requireOwner()) return;
    if (logs.some((log) => log.item_id === item.id && log.date === payload.date)) {
      showToast('这一天已打卡过这一条');
      setCheckInItem(null);
      return;
    }
    const log = { id: genId(), project_id: projectId, item_id: item.id, date: payload.date, note: payload.note || '', created_at: new Date().toISOString() };
    await insertLog(log);
    setLogs((current) => [log, ...current]);
    setCheckInItem(null);
    showToast('打卡成功 ✓');
  };

  const addNote = async ({ type, item, content, date }) => {
    if (!requireOwner()) return;
    const createdAt = type === 'extra' && date ? new Date(`${date}T12:00:00`).toISOString() : new Date().toISOString();
    const note = { id: genId(), project_id: projectId, item_id: item?.id || null, type, content, resolution: '', resolved: type === 'extra', created_at: createdAt, resolved_at: null };
    await insertNote(note);
    setNotes((current) => [note, ...current]);
    setAddNoteFor(null);
    showToast(type === 'extra' ? '已记录 ✓' : '难点已记录');
  };

  const addExtra = async () => {
    if (!requireOwner()) return;
    setAddNoteFor({ type: 'extra' });
  };

  const removeLog = async (id) => {
    if (!requireOwner()) return;
    await deleteLog(id);
    setLogs((current) => current.filter((log) => log.id !== id));
  };

  const removeNote = async (id) => {
    if (!requireOwner()) return;
    await deleteNote(id);
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  const toggleResolved = async (note) => {
    if (!requireOwner()) return;
    await updateNote(note.id, { resolved: !note.resolved, resolved_at: new Date().toISOString() });
    setNotes((current) => current.map((item) => (item.id === note.id ? { ...item, resolved: !item.resolved } : item)));
  };

  const saveNoteEdit = async (patch) => {
    if (!requireOwner() || !editingNote) return;
    await updateNote(editingNote.id, patch);
    setNotes((current) => current.map((note) => (note.id === editingNote.id ? { ...note, ...patch } : note)));
    setEditingNote(null);
    showToast('已更新');
  };

  const archive = async () => {
    if (!requireOwner()) return;
    await updateProject(projectId, { archived: true, archived_at: new Date().toISOString() });
    showToast('已归档');
  };

  return (
    <main className="mx-auto max-w-3xl p-5">
      <button className="btn-ghost mb-4 min-h-0 px-3 py-2 text-xs" onClick={() => navigate('/study')}>返回项目列表</button>
      <div className="card p-5">
        <div className="display text-3xl font-bold">{projectId}</div>
        <div className="mono mt-2 text-[11px]" style={{ color: 'var(--ink-faint)' }}>
          {logs.length} 次打卡 · {unresolvedCount} 个待解决难点
        </div>
      </div>
      {tab === 'plan' && <PlanView modules={plan} doneItemIds={doneItemIds} todayDoneIds={todayDoneIds} notes={notes.filter((note) => note.type === 'note')} onCheckin={setCheckInItem} onAddNote={(item) => setAddNoteFor({ type: 'note', item })} onArchive={archive} />}
      {tab === 'notes' && <NotesView notes={notes.filter((note) => note.type === 'note')} modules={plan} onDelete={removeNote} onResolve={toggleResolved} onEdit={setEditingNote} />}
      {tab === 'extra' && <ExtraView notes={notes.filter((note) => note.type === 'extra')} onAdd={addExtra} onDelete={removeNote} onEdit={setEditingNote} />}
      {tab === 'history' && <HistoryView logs={logs} onDelete={removeLog} />}
      <BottomTabBar tabs={tabs} active={tab} onChange={(id) => setSearchParams({ tab: id })} />
      {checkInItem && <CheckInModal item={checkInItem} onConfirm={(payload) => addCheckin(checkInItem, payload)} onCancel={() => setCheckInItem(null)} />}
      {addNoteFor && <AddNoteModal target={addNoteFor} onConfirm={addNote} onCancel={() => setAddNoteFor(null)} />}
      {editingNote && <EditNoteModal note={editingNote} modules={plan} onSave={saveNoteEdit} onCancel={() => setEditingNote(null)} />}
    </main>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 sm:items-center" onClick={onClose}>
      <div className="card w-full max-w-md p-5 animate-in" style={{ boxShadow: '0 20px 70px rgba(15, 28, 63, 0.22)' }} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CheckInModal({ item, onConfirm, onCancel }) {
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState('');
  return (
    <ModalShell onClose={onCancel}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mono mb-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Check in</div>
          <div className="display text-xl font-bold">{item.title}</div>
          <div className="mt-1 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{item.desc}</div>
        </div>
        <button className="btn-ghost min-h-0 rounded-full p-2" onClick={onCancel}><X size={15} /></button>
      </div>
      <label className="mb-4 block">
        <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>日期</span>
        <input className="input mono" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label className="mb-5 block">
        <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>备注（可选）</span>
        <textarea className="input" rows={3} style={{ border: '1.5px solid var(--line)', borderRadius: 12, minHeight: 78, padding: '10px 12px', resize: 'vertical' }} placeholder="今天学到了什么 / 卡在哪里..." value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={onCancel}>取消</button>
        <button className="btn-primary flex-[2]" onClick={() => onConfirm({ date, note })}><Check size={15} /> 确认打卡</button>
      </div>
    </ModalShell>
  );
}

function AddNoteModal({ target, onConfirm, onCancel }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(todayStr());
  const isExtra = target.type === 'extra';
  return (
    <ModalShell onClose={onCancel}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mono mb-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: isExtra ? '#dbeafe' : '#fee2e2', color: isExtra ? '#1e40af' : '#b91c1c' }}>{isExtra ? 'Extra' : 'Note'}</div>
          <div className="display text-xl font-bold">{isExtra ? '记录额外学习' : '记录难点'}</div>
          {target.item && <div className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>{target.item.title}</div>}
        </div>
        <button className="btn-ghost min-h-0 rounded-full p-2" onClick={onCancel}><X size={15} /></button>
      </div>
      {isExtra && (
        <label className="mb-4 block">
          <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>日期</span>
          <input className="input mono" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      )}
      <label className="mb-5 block">
        <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>{isExtra ? '学习内容' : '难点描述'}</span>
        <textarea className="input" rows={4} style={{ border: '1.5px solid var(--line)', borderRadius: 12, minHeight: 96, padding: '10px 12px', resize: 'vertical' }} value={content} onChange={(event) => setContent(event.target.value)} maxLength={500} />
        <div className="mono mt-1 text-right text-xs" style={{ color: 'var(--ink-faint)' }}>{content.length} / 500</div>
      </label>
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={onCancel}>取消</button>
        <button className="btn-primary flex-[2]" disabled={!content.trim()} onClick={() => onConfirm({ type: target.type, item: target.item, content: content.trim(), date })}><Check size={15} /> 保存</button>
      </div>
    </ModalShell>
  );
}

function EditNoteModal({ note, modules, onSave, onCancel }) {
  const [content, setContent] = useState(note.content || '');
  const [resolution, setResolution] = useState(note.resolution || '');
  const isExtra = note.type === 'extra';
  const item = modules.flatMap((module) => module.items.map((planItem) => ({ ...planItem, moduleTitle: module.title, moduleEmoji: module.emoji }))).find((planItem) => planItem.id === note.item_id);
  return (
    <ModalShell onClose={onCancel}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mono mb-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: isExtra ? '#dbeafe' : '#fee2e2', color: isExtra ? '#1e40af' : '#b91c1c' }}>{isExtra ? 'Extra' : 'Note'}</div>
          <div className="display text-xl font-bold">编辑记录</div>
          {item && <div className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>{item.moduleEmoji} {item.moduleTitle} · {item.title}</div>}
        </div>
        <button className="btn-ghost min-h-0 rounded-full p-2" onClick={onCancel}><X size={15} /></button>
      </div>
      <label className="mb-4 block">
        <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>{isExtra ? '学习内容' : '难点描述'}</span>
        <textarea className="input" rows={3} style={{ border: '1.5px solid var(--line)', borderRadius: 12, minHeight: 76, padding: '10px 12px', resize: 'vertical' }} value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      {!isExtra && (
        <label className="mb-5 block">
          <span className="mono mb-2 block text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>解决方案 / 补充资料（可选）</span>
          <textarea className="input" rows={3} style={{ border: '1.5px solid var(--line)', borderRadius: 12, minHeight: 76, padding: '10px 12px', resize: 'vertical' }} value={resolution} onChange={(event) => setResolution(event.target.value)} />
        </label>
      )}
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={onCancel}>取消</button>
        <button className="btn-primary flex-[2]" disabled={!content.trim()} onClick={() => onSave({ content: content.trim(), resolution: resolution.trim() })}><Check size={15} /> 保存修改</button>
      </div>
    </ModalShell>
  );
}
