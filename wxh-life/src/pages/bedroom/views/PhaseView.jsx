import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BottomTabBar from '../../../components/BottomTabBar';
import LoadingScreen from '../../../components/LoadingScreen';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { BarChart3, Calendar, ClipboardList } from '../../../icons';
import { todayStr } from '../../../lib/utils';
import { loadAllLogs, upsertLog } from '../api';
import { PHASES, phaseDates } from '../plans';
import CheckinTab from './CheckinTab';
import OverviewTab from './OverviewTab';
import StatsTab from './StatsTab';

export default function PhaseView() {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const phase = PHASES.find((item) => item.id === phaseId) || PHASES[0];
  const [logs, setLogs] = useState([]);
  const [activeDate, setActiveDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const dates = phaseDates(phase);
  const logMap = useMemo(() => Object.fromEntries(logs.map((log) => [log.date, log.data || {}])), [logs]);
  const tabs = [
    { id: 'overview', Icon: ClipboardList, label: '计划总览' },
    { id: 'checkin', Icon: Calendar, label: '每日打卡' },
    { id: 'stats', Icon: BarChart3, label: '统计' },
  ];

  useEffect(() => {
    loadAllLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const saveCurrent = async (date, nextData) => {
    if (!isOwner) {
      showToast('只读模式，请先登录');
      return;
    }
    await upsertLog(date, nextData);
    setLogs((currentLogs) => {
      const exists = currentLogs.some((log) => log.date === date);
      if (exists) return currentLogs.map((log) => (log.date === date ? { ...log, data: nextData } : log));
      return [{ id: date, date, data: nextData }, ...currentLogs];
    });
    showToast('已保存');
  };

  return (
    <main className="mx-auto max-w-3xl p-5">
      <button className="btn-ghost mb-4 min-h-0 px-3 py-2 text-xs" onClick={() => navigate('/bedroom')}>返回阶段列表</button>
      <section className="card p-5">
        <div className="display text-3xl font-bold">{phase.emoji} {phase.title}</div>
        <div className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{phase.targets}</div>
      </section>
      {tab === 'overview' && <OverviewTab phase={phase} dates={dates} logMap={logMap} onSelectDate={(date) => { setActiveDate(date); setSearchParams({ tab: 'checkin' }); }} />}
      {tab === 'checkin' && <CheckinTab phase={phase} dates={dates} activeDate={activeDate} setActiveDate={setActiveDate} current={logMap[activeDate] || {}} onSave={(next) => saveCurrent(activeDate, next)} />}
      {tab === 'stats' && <StatsTab logs={logs} dates={dates} />}
      <BottomTabBar tabs={tabs} active={tab} onChange={(id) => setSearchParams({ tab: id })} />
    </main>
  );
}
