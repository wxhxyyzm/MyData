import { Calendar } from '../../../icons';
import { getCalorieTarget, getExercisePlan } from '../plans';
import DailyItemCard from '../components/DailyItemCard';
import { DAILY_ITEMS } from '../plans';

export default function CheckinTab({ dates, activeDate, setActiveDate, current, onSave }) {
  const index = dates.indexOf(activeDate);
  const plan = getExercisePlan(activeDate);
  const set = (patch) => onSave({ ...current, ...patch });

  return (
    <section className="card mt-4 p-5">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button className="btn-ghost min-h-0 px-3 py-2" disabled={index <= 0} onClick={() => setActiveDate(dates[index - 1])}>前一天</button>
        <div className="text-center">
          <Calendar size={18} className="mx-auto mb-1" />
          <input className="input text-center" type="date" value={activeDate} onChange={(event) => setActiveDate(event.target.value)} />
        </div>
        <button className="btn-ghost min-h-0 px-3 py-2" disabled={index >= dates.length - 1} onClick={() => setActiveDate(dates[index + 1])}>后一天</button>
      </div>
      <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--accent-soft)' }}>
        <div className="font-bold">{plan.type}</div>
        <div className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>{plan.desc}</div>
        <div className="mono mt-2 text-[11px]" style={{ color: 'var(--ink-faint)' }}>热量目标 {getCalorieTarget(activeDate)} kcal</div>
      </div>
      <div className="mt-4 space-y-3">
        {DAILY_ITEMS.map((item) => <DailyItemCard key={item.key} item={item} value={current[item.key]} date={activeDate} plan={plan} calTarget={getCalorieTarget(activeDate)} onChange={(value) => set({ [item.key]: value })} />)}
        <div className="card p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold">备注</span>
            <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>水肿/嘴馋/头晕/怕冷/月经</span>
          </div>
          <textarea value={current.notes || ''} onChange={(event) => set({ notes: event.target.value })} placeholder="今天有什么特殊情况..." style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 13, minHeight: 60, outline: 'none', padding: '10px 12px', resize: 'vertical', width: '100%' }} />
        </div>
      </div>
    </section>
  );
}
