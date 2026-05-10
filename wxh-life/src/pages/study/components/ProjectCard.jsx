import { Link } from 'react-router-dom';

export default function ProjectCard({ project, archived = false }) {
  return (
    <Link to={`/study/${project.id}`} className="card block p-5 transition active:scale-[0.98]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl">{project.emoji || '📘'}</div>
          <div className="display mt-3 text-2xl font-bold">{project.name}</div>
          <div className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>{project.description}</div>
        </div>
        {archived && <span className="chip">已归档</span>}
      </div>
    </Link>
  );
}
