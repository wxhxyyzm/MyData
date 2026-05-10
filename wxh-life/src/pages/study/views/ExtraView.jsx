import { Plus } from '../../../icons';
import NoteCard from '../components/NoteCard';

export default function ExtraView({ notes, onAdd, onDelete, onEdit }) {
  return (
    <div className="mt-4">
      <button className="btn-primary mb-4" onClick={onAdd}><Plus size={16} />新增额外学习</button>
      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="card p-8 text-center">
            <div className="mb-3 text-5xl">✨</div>
            <div className="display text-lg font-semibold">额外学习</div>
            <div className="mt-2 text-xs leading-6" style={{ color: 'var(--ink-faint)' }}>记录主计划之外的论文、博客、视频和临时学习。</div>
          </div>
        )}
        {notes.map((note) => <NoteCard key={note.id} note={note} onDelete={onDelete} onEdit={onEdit} />)}
      </div>
    </div>
  );
}
