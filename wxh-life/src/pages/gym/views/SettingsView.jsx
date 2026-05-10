import CustomListCard from '../components/CustomListCard';

export default function SettingsView({ entries, custom, onSaveCustom }) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ entries, custom }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wxh-workout-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.custom) onSaveCustom({
          cardio: mergeByName(custom.cardio, parsed.custom.cardio || []),
          strength: mergeByName(custom.strength, parsed.custom.strength || []),
          locations: mergeByName(custom.locations, parsed.custom.locations || []),
        });
      } catch (error) {
        window.alert(error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="space-y-4 animate-in">
      <div className="card p-5">
        <div className="display text-2xl font-bold">数据与备份</div>
        <div className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>当前共有 {entries.length} 条训练记录。</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={exportJson}>导出 JSON</button>
          <label className="btn-ghost">
            导入 JSON
            <input className="hidden" type="file" accept="application/json" onChange={importJson} />
          </label>
        </div>
      </div>
      <CustomListCard title="自定义有氧项目" items={custom.cardio} onChange={(cardio) => onSaveCustom({ ...custom, cardio })} />
      <CustomListCard title="自定义无氧动作" items={custom.strength} onChange={(strength) => onSaveCustom({ ...custom, strength })} />
      <CustomListCard title="自定义场地" items={custom.locations} onChange={(locations) => onSaveCustom({ ...custom, locations })} />
    </section>
  );
}

function mergeByName(current, incoming) {
  const map = new Map();
  [...current, ...incoming].forEach((item) => map.set(item.name || item.label, item));
  return Array.from(map.values());
}
