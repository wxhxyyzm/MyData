import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { loadAllLogs } from './api';
import HomeView from './views/HomeView';
import PhaseView from './views/PhaseView';

export default function BedroomPage() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    loadAllLogs().then(setLogs).finally(() => setLoadingLogs(false));
  }, []);

  return (
    <div data-room="bedroom" className="min-h-screen pb-24 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={<><TopBar title="卧室" emoji="🛏️" /><HomeView logs={logs} /></>} />
        <Route path=":phaseId" element={<><TopBar title="卧室" emoji="🛏️" /><PhaseView logs={logs} setLogs={setLogs} loading={loadingLogs} /></>} />
      </Routes>
    </div>
  );
}
