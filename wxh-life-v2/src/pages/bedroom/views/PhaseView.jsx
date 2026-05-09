import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BottomTabBar from '../../../components/BottomTabBar';
import LoadingScreen from '../../../components/LoadingScreen';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { BarChart3, Calendar, ClipboardList } from '../../../icons';
import { todayStr } from '../../../lib/utils';
import { upsertLog } from '../api';
import { PHASES, phaseDates } from '../plans';
import CheckinTab from './CheckinTab';
import OverviewTab from './OverviewTab';
import StatsTab from './StatsTab';

export default function PhaseView({ logs, setLogs, loading }) {
  const { phaseId } = useParams();
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const phase = PHASES.find((item) => item.id === phaseId) || PHASES[0];
  const [activeDate, setActiveDate] = useState(todayStr());
  const dates = phaseDates(phase);
  const logMap = useMemo(() => Object.fromEntries(logs.map((log) => [log.date, log.data || {}])), [logs]);
  const tabs = [
    { id: 'overview', Icon: ClipboardList, label: '计划总览' },
    { id: 'checkin', Icon: Calendar, label: '每日打卡' },
    { id: 'stats', Icon: BarChart3, label: '统计' },
  ];

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
    <main className="mx-auto max-w-md px-5 pb-32">
      {tab === 'overview' && <OverviewTab phase={phase} dates={dates} logMap={logMap} onSelectDate={(date) => { setActiveDate(date); setSearchParams({ tab: 'checkin' }, { replace: true }); }} />}
      {tab === 'checkin' && <CheckinTab phase={phase} dates={dates} activeDate={activeDate} setActiveDate={setActiveDate} current={logMap[activeDate] || {}} onSave={(next) => saveCurrent(activeDate, next)} />}
      {tab === 'stats' && <StatsTab logs={logs} dates={dates} />}
      <BottomTabBar tabs={tabs} active={tab} onChange={(id) => setSearchParams({ tab: id }, { replace: true })} />
    </main>
  );
}
