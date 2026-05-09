import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomTabBar from '../../components/BottomTabBar';
import ErrorScreen from '../../components/ErrorScreen';
import LoadingScreen from '../../components/LoadingScreen';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Calendar, Plus, Settings, TrendingUp } from '../../icons';
import { deleteEntryById, insertEntry, loadCustom, loadEntries, saveCustom as saveCustomApi, updateEntry as updateEntryApi } from './api';
import LogView from './views/LogView';
import SettingsView from './views/SettingsView';
import StatsView from './views/StatsView';
import TodayView from './views/TodayView';

const TABS = [
  { id: 'today', label: '记录', Icon: Plus },
  { id: 'log', label: '日志', Icon: Calendar },
  { id: 'stats', label: '统计', Icon: TrendingUp },
  { id: 'settings', label: '设置', Icon: Settings },
];

export default function GymPage() {
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'today';
  const [entries, setEntries] = useState([]);
  const [custom, setCustom] = useState({ cardio: [], strength: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    Promise.all([loadEntries(), loadCustom()])
      .then(([entryData, customData]) => {
        setEntries(entryData);
        setCustom(customData);
      })
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const activeDays = new Set(entries.map((entry) => entry.date)).size;
    const cardioEntries = entries.filter((entry) => entry.type === 'cardio');
    const strengthEntries = entries.filter((entry) => entry.type === 'strength');
    const cardioMinutes = cardioEntries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0);
    return { total: entries.length, activeDays, cardio: cardioEntries.length, strength: strengthEntries.length, cardioMinutes };
  }, [entries]);

  if (loading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen title="健身房加载失败" message={loadError.message} />;

  const requireOwner = () => {
    if (isOwner) return true;
    showToast('只读模式，请先登录');
    return false;
  };

  const addEntry = async (entry) => {
    if (!requireOwner()) return;
    const nextEntry = { ...entry, id: Date.now() * 1000 + Math.floor(Math.random() * 1000), createdAt: new Date().toISOString() };
    setEntries((current) => [nextEntry, ...current]);
    try {
      await insertEntry(nextEntry);
      showToast('已保存训练记录');
    } catch (error) {
      setEntries((current) => current.filter((item) => item.id !== nextEntry.id));
      showToast(error.message);
    }
  };

  const updateEntry = async (entry) => {
    if (!requireOwner()) return;
    const previous = entries;
    setEntries((current) => current.map((item) => (item.id === entry.id ? entry : item)));
    try {
      await updateEntryApi(entry);
      showToast('已更新');
    } catch (error) {
      setEntries(previous);
      showToast(error.message);
    }
  };

  const deleteEntry = async (id) => {
    if (!requireOwner()) return;
    const previous = entries;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    try {
      await deleteEntryById(id);
      showToast('已删除');
    } catch (error) {
      setEntries(previous);
      showToast(error.message);
    }
  };

  const saveCustomPresets = async (nextCustom) => {
    if (!requireOwner()) return;
    setCustom(nextCustom);
    try {
      await saveCustomApi(nextCustom);
      showToast('已保存预设');
    } catch (error) {
      showToast(error.message);
    }
  };

  const addCustomPreset = async (type, preset) => {
    const nextCustom = { ...custom, [type]: [...(custom[type] || []), preset] };
    await saveCustomPresets(nextCustom);
  };

  return (
    <div data-room="gym" className="min-h-screen pb-24 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <TopBar title="健身房" emoji="🏋️" />
      <main className="mx-auto max-w-md p-4">
        {tab === 'today' && <TodayView entries={entries} custom={custom} onAdd={addEntry} onAddCustomPreset={addCustomPreset} />}
        {tab === 'log' && <LogView entries={entries} custom={custom} onDelete={deleteEntry} onUpdate={updateEntry} />}
        {tab === 'stats' && <StatsView entries={entries} stats={stats} custom={custom} />}
        {tab === 'settings' && <SettingsView entries={entries} custom={custom} onSaveCustom={saveCustomPresets} />}
      </main>
      <BottomTabBar tabs={TABS} active={tab} onChange={(id) => setSearchParams({ tab: id }, { replace: true })} />
    </div>
  );
}
