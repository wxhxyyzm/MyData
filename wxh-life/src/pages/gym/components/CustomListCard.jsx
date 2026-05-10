export default function CustomListCard({ title, items, onChange }) {
  const addItem = () => {
    const name = window.prompt(title);
    if (!name) return;
    onChange([...items, { name, label: name, emoji: '✨' }]);
  };

  return (
    <div className="card p-5">
      <div className="display text-xl font-bold">{title}</div>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div key={`${item.name || item.label}-${index}`} className="flex items-center justify-between rounded-2xl p-3" style={{ background: 'var(--accent-soft)' }}>
            <span>{item.emoji} {item.name || item.label}</span>
            <button className="btn-ghost min-h-0 px-3 py-2 text-xs" onClick={() => onChange(items.filter((_, i) => i !== index))}>删除</button>
          </div>
        ))}
      </div>
      <button className="btn-ghost mt-4" onClick={addItem}>新增</button>
    </div>
  );
}
