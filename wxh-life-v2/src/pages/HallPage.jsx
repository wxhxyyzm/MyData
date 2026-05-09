import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../hooks/useAuth';
import { useBedroomPreview } from '../hooks/useBedroomPreview';
import { useGymPreview } from '../hooks/useGymPreview';
import { useStudyPreview } from '../hooks/useStudyPreview';
import { getWeekday, todayStr } from '../lib/utils';
import { LogOut } from '../icons';

const ROOM_CONFIGS = [
  {
    id: 'gym',
    name: '健身房',
    subtitle: 'Workout',
    desc: '健身记录 · 有氧 & 无氧',
    emoji: '🏋️',
    color: '#d9603b',
    colorSoft: '#f2c9b5',
    path: '/gym',
  },
  {
    id: 'study',
    name: '书房',
    subtitle: 'Study',
    desc: '学习项目 · LLM面试备战',
    emoji: '📚',
    color: '#2563eb',
    colorSoft: '#dbeafe',
    path: '/study',
  },
  {
    id: 'bedroom',
    name: '卧室',
    subtitle: 'Bedroom',
    desc: '减重计划 · 35天验证期',
    emoji: '🛏️',
    color: '#16a34a',
    colorSoft: '#dcfce7',
    path: '/bedroom',
  },
];

export default function HallPage() {
  const navigate = useNavigate();
  const { exitGuest, isGuest, logout } = useAuth();
  const gymPreview = useGymPreview();
  const studyPreview = useStudyPreview();
  const bedroomPreview = useBedroomPreview();
  const today = todayStr();
  const previews = { gym: gymPreview, study: studyPreview, bedroom: bedroomPreview };

  const handleExit = async () => {
    localStorage.removeItem('wxh_guest_mode');
    if (isGuest) exitGuest();
    else await logout();
    navigate('/', { replace: true });
  };

  return (
    <main
      className="min-h-screen paper-texture"
      style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
    >
      {/* Top bar */}
      <header style={{ padding: '48px 20px 20px', maxWidth: 480, margin: '0 auto' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="display font-extrabold" style={{ fontSize: 28, lineHeight: 1.2 }}>
              WXH的数据空间
            </div>
            <div className="mono text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
              {getWeekday(today)} · {today}
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost min-h-0 px-3 py-2 text-xs"
            onClick={handleExit}
          >
            <LogOut size={14} />
            {isGuest ? '退出访客' : '登出'}
          </button>
        </div>
      </header>

      {/* Room cards */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ROOM_CONFIGS.map((room) => (
            <RoomCard key={room.id} {...room} preview={previews[room.id]} />
          ))}
        </div>
      </section>
    </main>
  );
}
