import { useMemo, useState } from 'react';
import { Check, Clock, Dumbbell, Flame, Heart } from '../../../icons';
import { todayStr } from '../../../lib/utils';
import EmojiPicker from '../components/EmojiPicker';
import ExtraFields from '../components/ExtraFields';
import { CARDIO_PRESETS, EMOJI_PALETTE_EXERCISE, STRENGTH_PRESETS, emptyExtras } from '../presets';

export default function TodayView({ entries, custom, onAdd, onAddCustomPreset }) {
  const [mode, setMode] = useState('cardio');
  const todayEntries = entries.filter((entry) => entry.date === todayStr());
  const todayCalories = todayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const todayMinutes = todayEntries.filter((entry) => entry.type === 'cardio').reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const todayReps = todayEntries.filter((entry) => entry.type === 'strength').reduce((sum, entry) => sum + (entry.sets || 0) * (entry.reps || 0), 0);

  return (
    <div className="animate-in">
      <div className="card p-5 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'var(--accent)', transform: 'translate(40%, -40%)' }} />
        <div className="relative">
          <div className="text-xs uppercase tracking-widest mono mb-2" style={{ color: 'var(--ink-faint)' }}>Today · 今日</div>
          <div className="flex items-baseline gap-2">
            <span className="display text-5xl font-bold">{todayEntries.length}</span>
            <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>次训练</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm flex-wrap" style={{ color: 'var(--ink-soft)' }}>
            {todayMinutes > 0 && <span className="flex items-center gap-1"><Clock size={14} style={{ color: 'var(--accent-2)' }} /><span className="mono font-semibold">{todayMinutes}</span> 分钟</span>}
            {todayCalories > 0 && <span className="flex items-center gap-1"><Flame size={14} style={{ color: 'var(--accent)' }} /><span className="mono font-semibold">{todayCalories}</span> kcal</span>}
            {todayReps > 0 && <span className="flex items-center gap-1"><Dumbbell size={14} style={{ color: 'var(--accent-2)' }} /><span className="mono font-semibold">{todayReps}</span> 次</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={`chip ${mode === 'cardio' ? 'active' : ''}`} onClick={() => setMode('cardio')} style={{ flex: 1, justifyContent: 'center' }}>
          <Heart size={14} /> 有氧
        </button>
        <button className={`chip ${mode === 'strength' ? 'active' : ''}`} onClick={() => setMode('strength')} style={{ flex: 1, justifyContent: 'center' }}>
          <Dumbbell size={14} /> 无氧
        </button>
      </div>

      {mode === 'cardio'
        ? <CardioForm onAdd={onAdd} custom={custom} onAddCustomPreset={onAddCustomPreset} />
        : <StrengthForm onAdd={onAdd} custom={custom} onAddCustomPreset={onAddCustomPreset} />}
    </div>
  );
}

function CardioForm({ onAdd, custom, onAddCustomPreset }) {
  const allPresets = useMemo(() => [...CARDIO_PRESETS, ...(custom?.cardio || [])], [custom]);
  const [selected, setSelected] = useState(allPresets[0]);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🏃');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(todayStr());
  const [useCustom, setUseCustom] = useState(false);
  const [extras, setExtras] = useState(emptyExtras());
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = duration && parseFloat(duration) > 0 && (useCustom ? customName.trim() : true);

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (useCustom) await onAddCustomPreset('cardio', { name: customName.trim(), emoji: customEmoji || '🏃' });
      await onAdd({
        type: 'cardio',
        name: useCustom ? customName.trim() : selected.name,
        emoji: useCustom ? (customEmoji || '🏃') : selected.emoji,
        duration: parseFloat(duration),
        calories: parseInt(calories, 10) || 0,
        date,
        ...extras,
      });
      setDuration('');
      setCalories('');
      setCustomName('');
      setCustomEmoji('🏃');
      setUseCustom(false);
      setExtras(emptyExtras());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5 animate-in">
      <div className="text-xs uppercase tracking-widest mono mb-3" style={{ color: 'var(--ink-faint)' }}>选择项目</div>
      <div className="flex flex-wrap gap-2 mb-5">
        {allPresets.map((preset) => (
          <button key={preset.name} className={`chip ${!useCustom && selected?.name === preset.name ? 'active' : ''}`} onClick={() => { setSelected(preset); setUseCustom(false); }}>
            <span>{preset.emoji}</span> {preset.name}
          </button>
        ))}
        <button className={`chip ${useCustom ? 'active' : ''}`} onClick={() => setUseCustom(true)}>+ 新项目</button>
      </div>
      {useCustom && <CustomPresetBox emoji={customEmoji} setEmoji={setCustomEmoji} name={customName} setName={setCustomName} placeholder="项目名称，例如：椭圆机" />}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Field label="时长 (分钟)"><input className="input mono" type="number" inputMode="decimal" placeholder="30" value={duration} onChange={(event) => setDuration(event.target.value)} /></Field>
        <Field label="卡路里"><input className="input mono" type="number" inputMode="decimal" placeholder="手动填写" value={calories} onChange={(event) => setCalories(event.target.value)} /></Field>
      </div>
      <Field label="日期" className="mb-5"><input className="input mono" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
      <ExtraFields extras={extras} setExtras={setExtras} custom={custom} onAddCustomPreset={onAddCustomPreset} />
      <button className="btn-primary w-full" onClick={submit} disabled={!canSubmit || submitting}>
        <Check size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: '-3px' }} />
        {submitting ? '保存中...' : '记录这次训练'}
      </button>
    </div>
  );
}

function StrengthForm({ onAdd, custom, onAddCustomPreset }) {
  const allPresets = useMemo(() => [...STRENGTH_PRESETS, ...(custom?.strength || [])], [custom]);
  const [selected, setSelected] = useState(allPresets[0]);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('💪');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [date, setDate] = useState(todayStr());
  const [useCustom, setUseCustom] = useState(false);
  const [extras, setExtras] = useState(emptyExtras());
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = sets && reps && parseInt(sets, 10) > 0 && parseInt(reps, 10) > 0 && (useCustom ? customName.trim() : true);

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (useCustom) await onAddCustomPreset('strength', { name: customName.trim(), emoji: customEmoji || '💪' });
      await onAdd({
        type: 'strength',
        name: useCustom ? customName.trim() : selected.name,
        emoji: useCustom ? (customEmoji || '💪') : selected.emoji,
        sets: parseInt(sets, 10),
        reps: parseInt(reps, 10),
        calories: 0,
        date,
        ...extras,
      });
      setSets('');
      setReps('');
      setCustomName('');
      setCustomEmoji('💪');
      setUseCustom(false);
      setExtras(emptyExtras());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5 animate-in">
      <div className="text-xs uppercase tracking-widest mono mb-3" style={{ color: 'var(--ink-faint)' }}>选择动作</div>
      <div className="flex flex-wrap gap-2 mb-5">
        {allPresets.map((preset) => (
          <button key={preset.name} className={`chip ${!useCustom && selected?.name === preset.name ? 'active' : ''}`} onClick={() => { setSelected(preset); setUseCustom(false); }}>
            <span>{preset.emoji}</span> {preset.name}
          </button>
        ))}
        <button className={`chip ${useCustom ? 'active' : ''}`} onClick={() => setUseCustom(true)}>+ 新动作</button>
      </div>
      {useCustom && <CustomPresetBox emoji={customEmoji} setEmoji={setCustomEmoji} name={customName} setName={setCustomName} placeholder="动作名称，例如：硬拉" />}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Field label="组数"><input className="input mono" type="number" inputMode="numeric" placeholder="3" value={sets} onChange={(event) => setSets(event.target.value)} /></Field>
        <Field label="每组次数"><input className="input mono" type="number" inputMode="numeric" placeholder="15" value={reps} onChange={(event) => setReps(event.target.value)} /></Field>
      </div>
      <Field label="日期" className="mb-5"><input className="input mono" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
      <ExtraFields extras={extras} setExtras={setExtras} custom={custom} onAddCustomPreset={onAddCustomPreset} />
      <button className="btn-primary w-full" onClick={submit} disabled={!canSubmit || submitting}>
        <Check size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: '-3px' }} />
        {submitting ? '保存中...' : '记录这次训练'}
      </button>
    </div>
  );
}

function CustomPresetBox({ emoji, setEmoji, name, setName, placeholder }) {
  return (
    <div className="mb-5 p-3 rounded-xl" style={{ background: 'var(--bg)', border: '1px dashed var(--line)' }}>
      <div className="text-xs mono mb-2" style={{ color: 'var(--ink-soft)' }}>ℹ️ 保存后会成为新的预设项目</div>
      <div className="flex gap-2 mb-3 items-start">
        <EmojiPicker value={emoji} onChange={setEmoji} palette={EMOJI_PALETTE_EXERCISE} />
        <input className="input" style={{ flex: 1 }} placeholder={placeholder} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-widest mono block mb-1" style={{ color: 'var(--ink-faint)' }}>{label}</label>
      {children}
    </div>
  );
}
