import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from '../../../icons';
import { getCalorieTarget, getExercisePlan, DAILY_ITEMS } from '../plans';
import { formatDate, getWeekday, todayStr } from '../../../lib/utils';
import DailyItemCard from '../components/DailyItemCard';

export default function CheckinTab({ phase, dates, activeDate, setActiveDate, current, onSave }) {
  const [formData, setFormData] = useState(current || {});
  const [dirty, setDirty] = useState(false);

  // Reset local form when date or external data changes
  useEffect(() => {
    setFormData(current || {});
    setDirty(false);
  }, [activeDate, current]);

  const today = todayStr();
  const index = dates.indexOf(activeDate);
  const prevDate = index > 0 ? dates[index - 1] : null;
  const nextDate = index < dates.length - 1 ? dates[index + 1] : null;
  const plan = getExercisePlan(activeDate);
  const calTarget = getCalorieTarget(activeDate);
  const isSat = new Date(activeDate + 'T00:00:00').getDay() === 6;

  const updateField = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(formData);
    setDirty(false);
  };

  return (
    <div className="px-5 animate-in" style={{ paddingBottom: 24 }}>
      {/* Date navigator */}
      <div className="flex items-center justify-between mb-2 mt-3">
        <button
          onClick={() => prevDate && setActiveDate(prevDate)}
          disabled={!prevDate}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '8px 10px',
            cursor: prevDate ? 'pointer' : 'default',
            color: prevDate ? 'var(--ink)' : 'var(--ink-faint)',
            opacity: prevDate ? 1 : 0.4,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <div className="display font-bold text-lg flex items-center gap-2 justify-center">
            {formatDate(activeDate)} {getWeekday(activeDate)}
            {current && Object.keys(current).length > 0 && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            )}
          </div>
          <div className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>
            Day {index + 1}/{phase.days}
            {activeDate === today && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>· 今天</span>}
          </div>
        </div>

        <button
          onClick={() => nextDate && setActiveDate(nextDate)}
          disabled={!nextDate}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '8px 10px',
            cursor: nextDate ? 'pointer' : 'default',
            color: nextDate ? 'var(--ink)' : 'var(--ink-faint)',
            opacity: nextDate ? 1 : 0.4,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Jump to today */}
      {activeDate !== today && dates.includes(today) && (
        <div className="text-center mb-3">
          <button onClick={() => setActiveDate(today)} className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>
            ↩ 回到今天
          </button>
        </div>
      )}
      {activeDate === today && <div className="mb-3" />}

      {/* Today's exercise plan */}
      <div
        className="card p-3 mb-4"
        style={{ background: 'var(--accent-soft)', border: `1.5px solid ${phase.color}40` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold" style={{ color: phase.color }}>📋 今日建议</span>
          <span
            className="mono text-xs px-2 py-0.5 rounded-full"
            style={{ background: phase.color + '20', color: phase.color }}
          >
            {plan.type}
          </span>
          {isSat && <span className="text-xs">🎉</span>}
        </div>
        <div className="text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--ink-faint)' }}>运动（参考）：</span>{plan.desc}
        </div>
        <div className="text-xs mt-1" style={{ color: phase.color, fontWeight: 600 }}>
          🎯 热量目标（严格）: {calTarget} kcal{isSat ? '（计划内好吃日）' : ''}
        </div>
      </div>

      {/* 10 check-in items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {DAILY_ITEMS.map((item) => (
          <DailyItemCard
            key={item.key}
            item={item}
            value={formData[item.key]}
            date={activeDate}
            plan={plan}
            calTarget={calTarget}
            onChange={(val) => updateField(item.key, val)}
          />
        ))}

        {/* Notes */}
        <div className="card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Pencil size={14} style={{ color: 'var(--ink-faint)' }} />
            <span className="text-xs font-semibold">备注</span>
            <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>水肿/嘴馋/头晕/怕冷/月经</span>
          </div>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="今天有什么特殊情况..."
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '10px 12px', fontSize: 13,
              fontFamily: 'var(--font-body)', color: 'var(--ink)',
              outline: 'none', resize: 'vertical', minHeight: 60,
            }}
          />
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!dirty}
        className="btn-primary"
        style={{ width: '100%', marginBottom: 16, opacity: dirty ? 1 : 0.5, cursor: dirty ? 'pointer' : 'default' }}
      >
        {dirty ? '保存这一天' : (current && Object.keys(current).length > 0 ? '已保存 ✓' : '暂无记录')}
      </button>
    </div>
  );
}
