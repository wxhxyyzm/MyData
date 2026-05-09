import { getCalorieStatus, getCalorieTarget } from '../plans';
import { Check, Dumbbell, Flame, Heart, Moon, Pill, Scale, Sun } from '../../../icons';

export default function DailyItemCard({ item, value, date, onChange, plan, calTarget }) {
  const Icon = iconMap[item.icon] || Heart;

  if (item.inputType === 'check') {
    return (
      <div className="card p-3">
        <Header Icon={Icon} label={item.label} />
        <button onClick={() => onChange(!value)} style={{ alignItems: 'center', background: value ? 'var(--accent)' : 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, color: value ? 'white' : 'var(--ink-soft)', cursor: 'pointer', display: 'flex', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, gap: 8, padding: '10px 16px', transition: 'all 0.15s ease', width: '100%' }}>
          {value ? <Check size={16} /> : <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--line)' }} />}
          {value ? '已完成' : '点击记录'}
        </button>
      </div>
    );
  }

  if (item.inputType === 'select') {
    return (
      <div className="card p-3">
        <Header Icon={Icon} label={item.label} />
        <div className="flex gap-2">
          {item.options.map((option) => (
            <button key={option} onClick={() => onChange(option)} style={{ background: value === option ? 'var(--accent-soft)' : 'var(--bg)', border: value === option ? '2px solid var(--accent)' : '1px solid var(--line)', borderRadius: 10, color: value === option ? 'var(--accent)' : 'var(--ink-soft)', cursor: 'pointer', flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '10px 8px' }}>
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.inputType === 'slider') {
    return (
      <div className="card p-3">
        <Header Icon={Icon} label={item.label} />
        <div className="mb-1 flex items-center justify-between">
          <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{item.min}</span>
          <span className="mono text-lg font-bold" style={{ color: value > 7 ? '#ef4444' : value > 4 ? '#eab308' : 'var(--accent)' }}>{value || '–'}</span>
          <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{item.max}</span>
        </div>
        <input type="range" min={item.min} max={item.max} value={value || 5} onChange={(event) => onChange(Number(event.target.value))} style={{ accentColor: 'var(--accent)', width: '100%' }} />
      </div>
    );
  }

  if (item.inputType === 'exercise') {
    return (
      <div className="card p-3">
        <Header Icon={Icon} label={item.label} />
        <div className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>建议: {plan?.desc}</div>
        <div className="flex items-center gap-2">
          <input type="number" value={value?.calories || ''} onChange={(event) => onChange({ ...value, calories: event.target.value })} placeholder="手表消耗(kcal)" style={{ ...inputStyle('var(--font-mono)'), flex: 1 }} />
          <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>kcal</span>
        </div>
      </div>
    );
  }

  if (item.inputType === 'time') {
    const [hh, mm] = (value || '').split(':');
    const setTime = (h, m) => onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const selStyle = { ...inputStyle('var(--font-mono)'), flex: 1, minWidth: 0, width: 0, appearance: 'none', WebkitAppearance: 'none', textAlign: 'center', cursor: 'pointer' };
    return (
      <div className="card p-3">
        <Header Icon={Icon} label={item.label} />
        <div className="flex items-center gap-2">
          <select value={hh || ''} onChange={(e) => setTime(e.target.value, mm || '00')} style={selStyle}>
            <option value="">时</option>
            {hours.map((h) => <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>)}
          </select>
          <span className="mono font-bold" style={{ color: 'var(--ink-faint)' }}>:</span>
          <select value={mm || ''} onChange={(e) => setTime(hh || '00', e.target.value)} style={selStyle}>
            <option value="">分</option>
            {minutes.map((m) => <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>)}
          </select>
        </div>
      </div>
    );
  }

  const calorieStatus = item.key === 'calories' ? getCalorieStatus(value, calTarget || getCalorieTarget(date)) : null;
  const borderColor = calorieStatus === 'over' ? '#ef4444' : calorieStatus === 'under' ? '#eab308' : calorieStatus === 'ok' ? 'var(--accent)' : 'var(--line)';
  const messageColor = calorieStatus === 'over' ? '#ef4444' : calorieStatus === 'under' ? '#eab308' : calorieStatus === 'ok' ? 'var(--accent)' : 'var(--ink-faint)';
  const target = calTarget || getCalorieTarget(date);
  const statusMessage = item.key === 'calories'
    ? calorieStatus === 'over'
      ? `超出目标 ${(Number(value) - target).toFixed(0)} kcal`
      : calorieStatus === 'under'
        ? `低于目标 ${(target - Number(value)).toFixed(0)} kcal`
        : calorieStatus === 'ok'
          ? `目标 ${target} kcal · 在范围内 ✓`
          : `今日目标 ${target} kcal`
    : null;

  return (
    <div className="card p-3">
      <Header Icon={Icon} label={item.label} />
      <div className="flex items-center gap-2">
        <input type="number" step="0.1" value={value || ''} placeholder={item.placeholder} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle('var(--font-mono)'), border: `${item.key === 'calories' && calorieStatus ? '2px' : '1px'} solid ${borderColor}`, flex: 1 }} />
        {item.unit && <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>{item.unit}</span>}
      </div>
      {statusMessage && <div className="mono mt-1 text-xs" style={{ color: messageColor }}>{statusMessage}</div>}
    </div>
  );
}

const iconMap = {
  sun: Sun,
  scale: Scale,
  pill: Pill,
  dumbbell: Dumbbell,
  flame: Flame,
  heart: Heart,
  moon: Moon,
};

function Header({ Icon, label }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon size={14} style={{ color: 'var(--accent)' }} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function inputStyle(fontFamily) {
  return {
    background: 'var(--bg-card)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    color: 'var(--ink)',
    colorScheme: 'light',
    fontFamily,
    fontSize: 13,
    outline: 'none',
    padding: '10px 12px',
    width: '100%',
  };
}
