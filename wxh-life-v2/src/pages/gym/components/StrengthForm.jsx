export default function StrengthForm({ form, setForm }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <input className="input" type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
      <input className="input" type="number" value={form.sets} onChange={(event) => setForm((prev) => ({ ...prev, sets: Number(event.target.value) }))} placeholder="组" />
      <input className="input" type="number" value={form.reps} onChange={(event) => setForm((prev) => ({ ...prev, reps: Number(event.target.value) }))} placeholder="次" />
      <input className="input" type="number" value={form.weight || ''} onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))} placeholder="重量 kg（可选）" />
    </div>
  );
}
