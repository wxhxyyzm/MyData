import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { Activity, BookOpen, Dumbbell, Leaf } from '../icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { enterAsGuest, isGuest, isOwner, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (isOwner || isGuest)) navigate('/hall', { replace: true });
  }, [isGuest, isOwner, loading, navigate]);

  if (loading) return <LoadingScreen />;

  const handleLogin = async () => {
    if (!email || !password || submitting) return;
    setSubmitting(true);
    setError('');
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate('/hall', { replace: true });
  };

  const handleGuest = () => {
    enterAsGuest();
    navigate('/hall', { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8" style={{ background: 'linear-gradient(145deg, #f4efe6 0%, #f0f4ff 52%, #f0faf0 100%)' }}>
      <div className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: '#77736d' }}>EST. 2026 · WXH</div>
          <h1 className="display mt-5 max-w-[560px] text-[62px] font-extrabold leading-[0.96]" style={{ color: '#191715' }}>
            电子生存数据
          </h1>
          <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
            {[
              { icon: Dumbbell, label: 'Workout', text: '训练记录' },
              { icon: BookOpen, label: 'Study', text: '学习打卡' },
              { icon: Leaf, label: 'Living', text: '健康追踪' },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-[22px] border border-white/50 bg-white/45 p-4 shadow-sm backdrop-blur">
                <Icon size={24} style={{ color: '#1a1a1a' }} />
                <div className="mono mt-5 text-[10px] uppercase tracking-[0.12em]" style={{ color: '#77736d' }}>{label}</div>
                <div className="mt-1 text-sm font-bold" style={{ color: '#191715' }}>{text}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="relative z-10 mx-auto flex w-full max-w-[390px] flex-col justify-center lg:mr-0">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-5 grid h-[76px] w-[76px] place-items-center rounded-[26px]" style={{ background: 'linear-gradient(145deg, #fbf7ef, #f8faff 52%, #f8fcf8)', boxShadow: '0 16px 46px rgba(26,26,26,0.13)' }}>
              <Activity size={34} strokeWidth={2.1} style={{ color: '#1a1a1a' }} />
            </div>
            <h1 className="display text-[30px] font-extrabold leading-tight" style={{ color: '#1a1a1a' }}>电子生存数据</h1>
            <div className="mono mt-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: '#77736d' }}>WXH LIFE DATA</div>
          </div>

        <section className="animate-in" style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(16px)', border: '1px solid rgba(232,230,224,0.85)', borderRadius: 28, boxShadow: '0 20px 70px rgba(26,26,26,0.10), 0 1px 0 rgba(255,255,255,0.9) inset', padding: '32px 28px' }}>
          <div className="mb-8 hidden items-center gap-4 lg:flex">
            <div className="grid h-14 w-14 place-items-center rounded-[18px]" style={{ background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)', color: '#ffffff' }}>
              <Activity size={27} />
            </div>
            <div>
              <div className="display text-[24px] font-extrabold" style={{ color: '#1a1a1a' }}>wxh-life</div>
              <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: '#77736d' }}>Private Access</div>
            </div>
          </div>
          <label className="block">
            <span className="mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#999999' }}>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
              autoComplete="email"
            />
          </label>
          <label className="mt-5 block">
            <span className="mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#999999' }}>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          )}
          <button
            type="button"
            className="mt-7 w-full rounded-2xl px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' }}
            disabled={submitting || !email || !password}
            onClick={handleLogin}
          >
            {submitting ? '进入中...' : '进入'}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-2xl border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5"
            style={{ borderColor: '#e8e6e0', color: '#1a1a1a' }}
            onClick={handleGuest}
          >
            无账号，仅查看数据
          </button>
        </section>

        <div className="mt-7 text-center text-xs leading-6" style={{ color: '#999999' }}>
          <div>这是 wxh 的私人空间。</div>
          <div>如需访问权限请联系 <span style={{ color: '#1a1a1a', fontWeight: 700 }}>wxh</span></div>
        </div>
        </div>
      </div>
    </main>
  );
}
