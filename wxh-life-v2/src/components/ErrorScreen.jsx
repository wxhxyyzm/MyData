import { AlertCircle } from '../icons';

export default function ErrorScreen({ title = '发生错误', message = '请稍后再试。' }) {
  return (
    <div className="min-h-screen grid place-items-center p-5 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="card animate-in max-w-sm px-8 py-7 text-center">
        <AlertCircle size={28} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
        <div className="display text-[22px] font-bold">{title}</div>
        <div className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>{message}</div>
      </div>
    </div>
  );
}
