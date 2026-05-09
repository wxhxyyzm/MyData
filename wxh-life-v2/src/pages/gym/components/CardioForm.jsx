export default function CardioForm({ form, setForm }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <input className="input" type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
      <input className="input" type="number" value={form.duration} onChange={(event) => setForm((prev) => ({ ...prev, duration: Number(event.target.value) }))} placeholder="分钟" />
      <input className="input col-span-2" type="number" value={form.calories || ''} onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))} placeholder="消耗 kcal（可选）" />
    </div>
  );
}
