import { Route, Routes } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import HomeView from './views/HomeView';
import PhaseView from './views/PhaseView';

export default function BedroomPage() {
  return (
    <div data-room="bedroom" className="min-h-screen pb-24 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={<><TopBar title="卧室" emoji="🛏️" /><HomeView /></>} />
        <Route path=":phaseId" element={<><TopBar title="卧室" emoji="🛏️" /><PhaseView /></>} />
      </Routes>
    </div>
  );
}
