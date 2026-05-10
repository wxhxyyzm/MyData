import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../hooks/useAuth';
import { useBedroomPreview } from '../hooks/useBedroomPreview';
import { useGymPreview } from '../hooks/useGymPreview';
import { useStudyPreview } from '../hooks/useStudyPreview';
import { getWeekday, todayStr } from '../lib/utils';
import { BookOpen, Clock3, Dumbbell, Leaf, LogOut, ShieldCheck } from '../icons';

const ROOM_CONFIGS = [
  {
    id: 'gym',
    name: '健身房',
    subtitle: 'Workout',
    emoji: '🏋️',
    color: '#d9603b',
    colorSoft: '#f2c9b5',
    description: '记录无氧训练、有氧、打卡和阶段性运动统计。后续会迁移现有运动日志。',
    path: '/gym',
    icon: Dumbbell,
    status: 'P1 迁移',
    metrics: [
      { label: '数据', value: '训练日志' },
      { label: '权限', value: '只读/编辑' },
    ],
  },
  {
    id: 'study',
    name: '书房',
    subtitle: 'Study',
    emoji: '📚',
    color: '#2563eb',
    colorSoft: '#dbeafe',
    description: '管理学习计划、每日打卡、难点笔记和额外学习记录。',
    path: '/study',
    icon: BookOpen,
    status: 'P2 迁移',
    metrics: [
      { label: '数据', value: '学习项目' },
      { label: '权限', value: '只读/编辑' },
    ],
  },
  {
    id: 'bedroom',
    name: '卧室',
    subtitle: 'Bedroom',
    emoji: '🛏️',
    color: '#16a34a',
    colorSoft: '#dcfce7',
    description: '沉淀健康、睡眠、用药、体重和日常状态追踪数据。',
    path: '/bedroom',
    icon: Leaf,
    status: 'P3 迁移',
    metrics: [
      { label: '数据', value: '健康追踪' },
      { label: '权限', value: '只读/编辑' },
    ],
  },
];

export default function HallPage() {
  const navigate = useNavigate();
  const { exitGuest, isGuest, logout } = useAuth();
  const gymPreview = useGymPreview();
  const studyPreview = useStudyPreview();
  const bedroomPreview = useBedroomPreview();
  const today = todayStr();
  const previews = {
    gym: gymPreview,
    study: studyPreview,
    bedroom: bedroomPreview,
  };

  const handleExit = async () => {
    localStorage.removeItem('wxh_guest_mode');
    if (isGuest) {
      exitGuest();
    } else {
      await logout();
    }
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen overflow-hidden paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <header className="mx-auto max-w-6xl px-5 pb-6 pt-5 sm:pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px]" style={{ color: 'var(--ink-faint)' }}>EST. 2026 · WXH</div>
          <button
            type="button"
            className="btn-ghost min-h-0 rounded-full px-4 py-2 text-xs"
            onClick={handleExit}
            title="返回登录并清除当前状态"
          >
            <LogOut size={15} />
            返回登录
          </button>
        </div>

        <div className="mt-8 grid gap-6 rounded-[28px] border p-5 sm:p-7 lg:grid-cols-[1fr_auto]" style={{ background: 'color-mix(in srgb, var(--bg-card), transparent 8%)', borderColor: 'var(--line)', boxShadow: '0 20px 70px color-mix(in srgb, var(--ink), transparent 94%)' }}>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'var(--accent-soft)', color: 'var(--ink-soft)' }}>
              <ShieldCheck size={14} />
              <span className="mono text-[10px] uppercase tracking-[0.10em]">{isGuest ? 'Guest · Read Only' : 'Owner · Full Access'}</span>
            </div>
            <h1 className="display mt-5 text-[36px] font-extrabold leading-[0.98] sm:text-[48px] lg:text-[56px]">
              电子生存数据
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 sm:text-base" style={{ color: 'var(--ink-soft)' }}>
              这里是所有个人数据房间的入口。每个房间保留独立主题和数据边界，后续旧版运动、学习、健康模块会分阶段迁移进来。
            </p>
          </div>
          <div className="flex items-end justify-between gap-5 lg:block lg:min-w-[140px] lg:text-right">
            <div>
              <div className="mono text-[12px]" style={{ color: 'var(--ink-faint)' }}>{getWeekday(today)}</div>
              <div className="display text-[44px] font-semibold leading-none" style={{ color: 'var(--accent)' }}>{today.slice(8)}</div>
            </div>
            <div className="rounded-2xl px-4 py-3 lg:mt-5" style={{ background: 'var(--accent-soft)' }}>
              <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.10em]" style={{ color: 'var(--ink-soft)' }}>
                <Clock3 size={13} />
                P0
              </div>
              <div className="mt-1 text-sm font-bold">骨架阶段</div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-2">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-faint)' }}>Rooms</div>
            <h2 className="display mt-1 text-2xl font-bold">选择房间</h2>
          </div>
          <div className="hidden text-sm sm:block" style={{ color: 'var(--ink-soft)' }}>3 个模块待迁移</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        {ROOM_CONFIGS.map((room) => <RoomCard key={room.id} {...room} preview={previews[room.id]} />)}
        </div>
      </section>

      <footer className="mono mt-16 pb-10 text-center text-[11px]" style={{ color: 'var(--ink-faint)' }}>
        v0.1
      </footer>
    </main>
  );
}
