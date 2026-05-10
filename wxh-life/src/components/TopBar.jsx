import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from '../icons';

export default function TopBar({ title, emoji, onBack, rightSlot }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate('/hall'));

  return (
    <div className="sticky top-0 z-10" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
      <div className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-3">
        <button type="button" className="btn-ghost min-h-0 px-3 py-2 text-xs" onClick={handleBack}>
          <ChevronLeft size={15} />
          <Home size={14} />
          大厅
        </button>
        <div className="display flex min-w-0 items-center gap-2 text-[18px] font-bold">
          <span>{emoji}</span>
          <span className="truncate">{title}</span>
        </div>
        <div className="min-w-[74px] flex justify-end">{rightSlot}</div>
      </div>
    </div>
  );
}
