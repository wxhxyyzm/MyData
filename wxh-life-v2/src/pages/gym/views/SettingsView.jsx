import { useRef } from 'react';
import { Download } from '../../../icons';
import CustomListCard from '../components/CustomListCard';

export default function SettingsView({ entries, custom, onSaveCustom }) {
  const fileInputRef = useRef(null);

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
    event.target.value = '';
  };

  return (
    <div className="animate-in space-y-4">
      <div className="card p-5">
        <div className="mb-3">
          <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>Data</div>
          <div className="display text-lg font-semibold">我的数据</div>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="display text-4xl font-bold">{entries.length}</div>
            <div className="mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>条训练记录</div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 14px' }}>
              <Download size={14} style={{ transform: 'rotate(180deg)' }} />
              导入
            </button>
            <button className="btn-ghost" onClick={exportJson} style={{ padding: '10px 14px' }}>
              <Download size={14} />
              导出
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
          </div>
        </div>
        <div className="text-xs" style={{ color: 'var(--ink-faint)', lineHeight: 1.6 }}>
          ☁️ 数据保存在 Supabase 云端，多设备同步。导出 JSON 可作为本地备份，方便迁移。
        </div>
      </div>

      <CustomListCard
        title="自定义有氧项目"
        items={custom.cardio}
        empty="还没有自定义项目。在「记录」页点「+ 新项目」就能添加，保存后会出现在这里。"
        onChange={(cardio) => onSaveCustom({ ...custom, cardio })}
      />
      <CustomListCard
        title="自定义无氧动作"
        items={custom.strength}
        empty="还没有自定义动作。在「记录」页点「+ 新动作」就能添加。"
        onChange={(strength) => onSaveCustom({ ...custom, strength })}
      />
      <CustomListCard
        title="自定义场地"
        items={custom.locations}
        empty="还没有自定义场地。在「记录」页场地那里点「+ 新场地」就能添加。"
        onChange={(locations) => onSaveCustom({ ...custom, locations })}
      />

      <div className="card p-5">
        <div className="mb-2">
          <div className="mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>About</div>
          <div className="display text-lg font-semibold">关于</div>
        </div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          专注统计性的个人运动记录工具。数据保存在 Supabase 云端，多设备实时同步，建议定期导出备份。
        </div>
      </div>
    </div>
  );
}

function mergeByName(current, incoming) {
  const map = new Map();
  [...current, ...incoming].forEach((item) => map.set(item.name || item.label, item));
  return Array.from(map.values());
}
