import NoteCard from '../components/NoteCard';

export default function NotesView({ notes, modules = [], onDelete, onResolve, onEdit }) {
  const itemMap = modules.reduce((acc, module) => {
    module.items.forEach((item) => {
      acc[item.id] = { ...item, moduleTitle: module.title, moduleEmoji: module.emoji, moduleColor: module.color };
    });
    return acc;
  }, {});
  const open = notes.filter((note) => !note.resolved);
  const resolved = notes.filter((note) => note.resolved);

  return (
    <div className="mt-4 space-y-4">
      <Summary title="待解决" count={open.length} />
      {open.map((note) => <NoteCard key={note.id} note={note} item={itemMap[note.item_id]} onDelete={onDelete} onResolve={onResolve} onEdit={onEdit} />)}
      <Summary title="已解决" count={resolved.length} />
      {resolved.map((note) => <NoteCard key={note.id} note={note} item={itemMap[note.item_id]} onDelete={onDelete} onResolve={onResolve} onEdit={onEdit} />)}
    </div>
  );
}

function Summary({ title, count }) {
  return <div className="card p-4"><span className="font-bold">{title}</span><span className="mono ml-2 text-[11px]" style={{ color: 'var(--ink-faint)' }}>{count}</span></div>;
}
