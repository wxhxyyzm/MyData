import { Link } from 'react-router-dom';
import { Archive, RotateCcw } from '../../../icons';

export default function ProjectCard({ project, onArchive, onRestore }) {
  const archived = project.archived;
  return (
    <div className="card overflow-hidden">
      <Link to={`/study/${project.id}`} style={{ display: 'block', padding: '16px 16px 12px', textDecoration: 'none' }}>
        <div className="flex items-start gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: archived ? 'var(--line)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {project.emoji || '📘'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-semibold text-sm" style={{ color: archived ? 'var(--ink-faint)' : 'var(--ink)' }}>{project.name}</div>
            {project.description && <div className="text-xs mt-0.5 leading-5" style={{ color: 'var(--ink-soft)' }}>{project.description}</div>}
          </div>
          {archived && <span className="mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--line)', color: 'var(--ink-faint)', flexShrink: 0 }}>已归档</span>}
        </div>
      </Link>
      <div className="border-t flex" style={{ borderColor: 'var(--line)' }}>
        {!archived && onArchive && (
          <button onClick={() => onArchive(project.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs" style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Archive size={13} /> 归档
          </button>
        )}
        {archived && onRestore && (
          <button onClick={() => onRestore(project.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <RotateCcw size={13} /> 恢复
          </button>
        )}
      </div>
    </div>
  );
}
