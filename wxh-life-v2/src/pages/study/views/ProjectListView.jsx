import { useEffect, useState } from 'react';
import ErrorScreen from '../../../components/ErrorScreen';
import LoadingScreen from '../../../components/LoadingScreen';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { loadProjects, updateProject } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function ProjectListView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOwner } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadProjects().then(setProjects).catch(setError).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="书房加载失败" message={error.message} />;

  const handleArchive = async (id) => {
    if (!isOwner) { showToast('只读模式，请先登录'); return; }
    await updateProject(id, { archived: true, archived_at: new Date().toISOString() });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)));
    showToast('已归档');
  };

  const handleRestore = async (id) => {
    if (!isOwner) { showToast('只读模式，请先登录'); return; }
    await updateProject(id, { archived: false, archived_at: null });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, archived: false } : p)));
    showToast('已恢复');
  };

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <main className="mx-auto max-w-md pb-10 animate-in">
      <div className="px-5 pt-3 pb-5">
        <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>
          {active.length} 个进行中{archived.length > 0 ? ` · ${archived.length} 个已归档` : ''}
        </div>
      </div>
      <div className="px-5 space-y-3">
        {active.map((project) => (
          <ProjectCard key={project.id} project={project} onArchive={isOwner ? handleArchive : null} />
        ))}
        {active.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--ink-faint)' }}>暂无进行中的项目</div>
        )}
      </div>
      {archived.length > 0 && (
        <details className="mt-6 px-5">
          <summary className="mono cursor-pointer text-xs py-1" style={{ color: 'var(--ink-faint)', listStyle: 'none' }}>
            ▸ 已归档 · {archived.length}
          </summary>
          <div className="mt-3 space-y-3">
            {archived.map((project) => (
              <ProjectCard key={project.id} project={project} onRestore={isOwner ? handleRestore : null} />
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
