import { Route, Routes } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import ProjectDetailView from './views/ProjectDetailView';
import ProjectListView from './views/ProjectListView';

export default function StudyPage() {
  return (
    <div data-room="study" className="min-h-screen pb-24 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={<><TopBar title="书房" emoji="📚" /><ProjectListView /></>} />
        <Route path=":projectId" element={<><TopBar title="书房" emoji="📚" /><ProjectDetailView /></>} />
      </Routes>
    </div>
  );
}
