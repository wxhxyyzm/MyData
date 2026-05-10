import { Loader2 } from '../icons';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen grid place-items-center paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="card animate-in flex flex-col items-center gap-4 px-8 py-7">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <div className="mono text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--ink-faint)' }}>
          Loading
        </div>
      </div>
    </div>
  );
}
