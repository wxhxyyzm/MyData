import { useState } from 'react';

export default function EditEntryModal({ entry, onClose, onSave }) {
  const [draft, setDraft] = useState(entry);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/30 p-4 sm:place-items-center">
      <div className="card w-full max-w-md p-5">
        <div className="display text-2xl font-bold">编辑记录</div>
        <input className="input mt-4" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <input className="input mt-3" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
        {draft.type === 'cardio' ? (
          <input className="input mt-3" type="number" value={draft.duration || ''} onChange={(event) => setDraft({ ...draft, duration: Number(event.target.value) })} />
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input className="input" type="number" value={draft.sets || ''} onChange={(event) => setDraft({ ...draft, sets: Number(event.target.value) })} />
            <input className="input" type="number" value={draft.reps || ''} onChange={(event) => setDraft({ ...draft, reps: Number(event.target.value) })} />
          </div>
        )}
        <textarea className="input mt-3" value={draft.extras?.note || ''} onChange={(event) => setDraft({ ...draft, extras: { ...(draft.extras || {}), note: event.target.value } })} />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => onSave(draft)}>保存</button>
        </div>
      </div>
    </div>
  );
}
