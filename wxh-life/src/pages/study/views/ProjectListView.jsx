import { useEffect, useState } from 'react';
import ErrorScreen from '../../../components/ErrorScreen';
import LoadingScreen from '../../../components/LoadingScreen';
import { loadProjects } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function ProjectListView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects().then(setProjects).catch(setError).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="书房加载失败" message={error.message} />;

  const active = projects.filter((project) => !project.archived);
  const archived = projects.filter((project) => project.archived);

  return (
    <main className="mx-auto max-w-3xl p-5">
      <div className="mb-5">
        <div className="display text-3xl font-bold">学习项目</div>
        <div className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>进行中的项目在前，归档项目集中在下方。</div>
      </div>
      <div className="space-y-4">
        {active.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
      {archived.length > 0 && (
        <details className="mt-6">
          <summary className="mono cursor-pointer text-[12px]" style={{ color: 'var(--ink-faint)' }}>已归档项目 · {archived.length}</summary>
          <div className="mt-4 space-y-4">
            {archived.map((project) => <ProjectCard key={project.id} project={project} archived />)}
          </div>
        </details>
      )}
    </main>
  );
}
