# wxh的电子生存数据 — 房间迁移完整文档

> 这份文档承接 P0 阶段（骨架已搭好）。本文档要把三个原 HTML 项目的全部业务逻辑迁移到 Vite+React 项目里，并完成 UI 统一。
> 一次性迁移三个房间，不分阶段，但内部按章节组织以方便排查问题。

---

## 零、前置确认

开始本次任务之前，请先确认 P0 阶段已完成：

1. ☐ 项目根目录是 `wxh-life/`，可以 `npm run dev` 启动
2. ☐ 登录页、大厅、三个房间占位页都能正常显示
3. ☐ CSS 变量令牌系统（tokens.css / components.css）正常工作，房间间切换主题色无问题
4. ☐ useAuth、useToast、AuthGuard、TopBar、RoomCard 等基础设施都已实现

如果 P0 还没完成，**先回到 P0 文档执行完毕再开始本任务**。

---

## 一、本次任务总目标

**保留：**

- 三个房间各自的主题色（橙/蓝/绿），通过 `data-room` 自动应用
- 三个房间各自的页面结构、tab 导航、所有交互逻辑
- 三个房间各自的业务功能（打卡、记录、统计、笔记、归档等等），一个不少
- 三个房间各自的视觉特色细节（比如 workout 的 paper-texture 纸质纹理）

**统一：**

- 所有房间共用同一套组件类（`.card` `.btn-primary` `.btn-ghost` `.input` `.chip` `.tab-btn` `.toast` `.animate-in`），样式定义只在 `components.css` 里出现一次
- 所有图标统一用 `lucide-react@0.292.0` 直接导入，**删掉三个项目里手写的 LucideIcon / findLucideIcon 兼容代码**
- 所有颜色硬编码改成 CSS 变量（`var(--accent)` 等），房间切换自动生效
- Toast 系统统一用全局 `useToast` hook，三个房间不再各自管理 toast 状态
- Auth 系统统一用全局 `useAuth` hook，**三个房间内部的 LoginScreen / session 管理代码全部删除**
- LoadingScreen / ErrorScreen 统一用 `components/` 里的版本

**不统一（保留差异）：**

- 各房间的内部布局和具体 UI 形态（比如 study 是项目列表式、bedroom 是阶段卡片式、gym 是 tab 式），这是它们的灵魂，不强行统一
- 各房间的 emoji、文案、tab 数量、tab 名称
- 各房间的表单字段、模态框设计

---

## 二、重要变更：第三个房间从「客厅」改为「卧室」

经过讨论，第三个房间从 `living` 改为 `bedroom`，理由是「健康日志」记录的是起床时间、体重、睡眠等私密身体数据，更契合卧室而非客厅。

需要做的变更：

- `data-room="living"` → `data-room="bedroom"`
- 路由 `/living` → `/bedroom`
- 文件夹 `pages/living/` → `pages/bedroom/`
- 文件 `LivingRoomPage.jsx` → `BedroomPage.jsx`
- 大厅 ROOMS 配置里 id `living` → `bedroom`，name `客厅` → `卧室`，subtitle `Living` → `Bedroom`，emoji `🌿` → `🛏️`
- App.jsx 路由配置同步更新

颜色保持绿色不变。

---

## 三、最终目录结构

迁移完成后，项目结构应该是：

```
wxh-life/
├── public/
│   └── icon.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.js              ← 扩充：添加更多共用工具函数
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useToast.js
│   │   ├── useGymPreview.js      ← 新增
│   │   ├── useStudyPreview.js    ← 新增
│   │   └── useBedroomPreview.js  ← 新增
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── components.css
│   │   └── global.css
│   │
│   ├── components/
│   │   ├── AuthGuard.jsx
│   │   ├── RoomCard.jsx          ← 改造：支持 preview 字段动态渲染
│   │   ├── TopBar.jsx
│   │   ├── ToastContainer.jsx
│   │   ├── LoadingScreen.jsx
│   │   └── ErrorScreen.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── HallPage.jsx          ← 改造：使用 preview hooks 填充卡片预览
│   │   │
│   │   ├── gym/
│   │   │   ├── GymPage.jsx       ← 入口，路由 + tab 切换
│   │   │   ├── api.js            ← 数据库 CRUD
│   │   │   ├── presets.js        ← 常量
│   │   │   ├── views/
│   │   │   │   ├── TodayView.jsx
│   │   │   │   ├── LogView.jsx
│   │   │   │   ├── StatsView.jsx
│   │   │   │   └── SettingsView.jsx
│   │   │   ├── components/
│   │   │   │   ├── CardioForm.jsx
│   │   │   │   ├── StrengthForm.jsx
│   │   │   │   ├── ExtraFields.jsx
│   │   │   │   ├── EmojiPicker.jsx
│   │   │   │   ├── LogItem.jsx
│   │   │   │   ├── EditEntryModal.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── CustomListCard.jsx
│   │   │
│   │   ├── study/
│   │   │   ├── StudyPage.jsx       ← 入口，路由（含项目详情子路由）
│   │   │   ├── api.js
│   │   │   ├── plans.js            ← PROJECT_PLANS 硬编码
│   │   │   ├── views/
│   │   │   │   ├── ProjectListView.jsx
│   │   │   │   ├── ProjectDetailView.jsx
│   │   │   │   ├── PlanView.jsx
│   │   │   │   ├── NotesView.jsx
│   │   │   │   ├── ExtraView.jsx
│   │   │   │   └── HistoryView.jsx
│   │   │   ├── components/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ArchivedProjectCard.jsx
│   │   │   │   ├── ProjectHeader.jsx
│   │   │   │   ├── ModuleCard.jsx
│   │   │   │   ├── StudyItem.jsx
│   │   │   │   ├── NoteCard.jsx
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   ├── Heatmap.jsx
│   │   │   │   ├── TrendChart.jsx
│   │   │   │   └── modals/
│   │   │   │       ├── CheckInModal.jsx
│   │   │   │       ├── AddNoteModal.jsx
│   │   │   │       ├── EditNoteModal.jsx
│   │   │   │       ├── EditSubtitleModal.jsx
│   │   │   │       └── ArchiveModal.jsx
│   │   │
│   │   └── bedroom/
│   │       ├── BedroomPage.jsx     ← 入口，路由（含阶段详情子路由）
│   │       ├── api.js
│   │       ├── plans.js            ← PHASES、DAILY_ITEMS、getExercisePlan 等
│   │       ├── views/
│   │       │   ├── HomeView.jsx        ← 阶段列表
│   │       │   ├── PhaseView.jsx       ← 阶段详情外壳
│   │       │   ├── OverviewTab.jsx
│   │       │   ├── CheckinTab.jsx
│   │       │   └── StatsTab.jsx
│   │       ├── components/
│   │       │   ├── DailyItemCard.jsx
│   │       │   └── WeightChart.jsx
│   │
│   └── icons/
│       └── index.js              ← 从 lucide-react re-export 用到的所有图标
│
├── .env
├── .env.example
├── .gitignore
├── _redirects
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 四、第 1 章：共享工具与图标统一

### 4.1 扩充 `src/lib/utils.js`

P0 阶段已经写过基础版本，本章扩充。完整内容应包含：

```js
// 生成唯一整数 ID（兼容 Supabase bigint）
export function genId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

// 今天的日期字符串 YYYY-MM-DD
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 把 YYYY-MM-DD 显示成"5月7日"
export function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return `${d.getMonth()+1}月${d.getDate()}日`;
}

// 把 YYYY-MM-DD 显示成"05-07"
export function formatDateShort(str) {
  const d = new Date(str);
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ISO 时间戳转相对时间："今天 / 昨天 / 3天前 / 2周前 / 5/3"
export function relativeDate(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const days = Math.floor((now - d) / (1000*60*60*24));
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days/7)}周前`;
  return `${d.getMonth()+1}/${d.getDate()}`;
}

// 两个 YYYY-MM-DD 之间的天数（b - a）
export function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// YYYY-MM-DD → "周一" 等
export function getWeekday(str) {
  return ['周日','周一','周二','周三','周四','周五','周六'][new Date(str + 'T00:00:00').getDay()];
}
```

### 4.2 创建 `src/icons/index.js`

把三个原项目里所有用到的图标统一从 `lucide-react` 导出。**重要：所有原项目里手写的 `LucideIcon` / `findLucideIcon` / `createIcon` 等兼容代码必须全部删除**，直接 import 使用。

```js
export {
  // 通用
  X, Check, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Calendar, Clock, Settings, Download,
  // 健身房
  Flame, Dumbbell, Heart, TrendingUp,
  // 书房
  Archive, Trophy, Layers, Lightbulb, Sparkles,
  AlertCircle, CheckCircle2,
  // 卧室
  Sun, Moon, Pill, Scale, ClipboardList, BarChart3,
  // 大厅
  LogOut,
} from 'lucide-react';
```

如果实际迁移过程中发现还有其他图标用到，按需追加。

### 4.3 删除原项目里的图标兼容代码

迁移过程中遇到这些代码，**直接删除**，改用 `import { X, Check, ... } from '../../icons'`：

- `function findLucideIcon(name)` 整个函数
- `const LucideIcon = ({ name, size, ... }) => { ... }` 整个组件
- `const createIcon = (name) => { ... }` （workout 项目用了这种写法）
- `const X = (p) => <LucideIcon name="x" {...p} />;` 这种逐个的别名定义

替换为：

```js
import { X, Check, Plus, ChevronLeft, ChevronDown, Pencil, Trash2 } from '../../icons';
// 用法：<X size={16} /> <Check size={14} style={{...}} />
```

---

## 五、第 2 章：健身房（Gym）迁移

源文件：`workout/index.html`
目标位置：`src/pages/gym/`
data-room: `gym`
路由：`/gym`（query param 控制 tab）

### 5.1 `pages/gym/api.js`

把原 HTML 里 Supabase 数据库读写函数全部抽到这里：

```js
import { supabase } from '../../lib/supabase';
import { genId } from '../../lib/utils';

// 加载所有训练记录（按 id 倒序）
export async function loadEntries() {
  const { data, error } = await supabase
    .from("workout_entries")
    .select("id, data")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({ ...row.data, id: row.id }));
}

// 插入单条记录
export async function insertEntry(entry) {
  try {
    const { error } = await supabase
      .from("workout_entries")
      .insert({ id: entry.id, data: entry });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Insert entry failed:", e);
    return false;
  }
}

// 更新单条记录
export async function updateEntry(entry) {
  try {
    const { error } = await supabase
      .from("workout_entries")
      .update({ data: entry })
      .eq("id", entry.id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Update entry failed:", e);
    return false;
  }
}

// 删除单条记录
export async function deleteEntryById(id) {
  try {
    const { error } = await supabase
      .from("workout_entries")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Delete entry failed:", e);
    return false;
  }
}

// 加载自定义预设
export async function loadCustom() {
  const { data, error } = await supabase
    .from("workout_custom")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (data) {
    const parsed = data.data;
    return {
      cardio:    Array.isArray(parsed.cardio)    ? parsed.cardio    : [],
      strength:  Array.isArray(parsed.strength)  ? parsed.strength  : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
    };
  }
  return { cardio: [], strength: [], locations: [] };
}

// 保存自定义预设（整体覆盖）
export async function saveCustom(custom) {
  try {
    const { error } = await supabase
      .from("workout_custom")
      .upsert({ id: 1, data: custom, updated_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Save custom failed:", e);
    return false;
  }
}
```

### 5.2 `pages/gym/presets.js`

把原 HTML 里所有常量抽到这里：

```js
export const CARDIO_PRESETS = [
  { name: "跳操", caloriesPerMin: 8, emoji: "💃" },
  { name: "爬坡", caloriesPerMin: 9, emoji: "⛰️" },
  { name: "骑行", caloriesPerMin: 7, emoji: "🚴" },
  { name: "跳绳", caloriesPerMin: 12, emoji: "🪢" },
  { name: "游泳", caloriesPerMin: 11, emoji: "🏊" },
];

export const STRENGTH_PRESETS = [
  { name: "深蹲", emoji: "🦵" },
  { name: "俯卧撑", emoji: "💪" },
  { name: "平板支撑", emoji: "🧘" },
  { name: "卷腹", emoji: "🔥" },
  { name: "臀桥", emoji: "🍑" },
  { name: "哑铃", emoji: "🏋️" },
];

export const MOOD_OPTIONS = [
  { key: "energized",  emoji: "💪",   label: "充满能量" },
  { key: "calm",       emoji: "😌",   label: "平静" },
  { key: "tired",      emoji: "😮‍💨", label: "疲惫" },
  { key: "struggling", emoji: "🥵",   label: "吃力" },
];

export const DEFAULT_LOCATION_PRESETS = [
  { key: "home",          emoji: "🏠",  label: "家里" },
  { key: "gym",           emoji: "🏋️",  label: "健身房" },
  { key: "activity_room", emoji: "🏛️",  label: "活动室" },
  { key: "outdoor",       emoji: "🌳",  label: "户外" },
  { key: "travel",        emoji: "✈️",  label: "出差" },
];

export const EMOJI_PALETTE_EXERCISE = [
  // 完整数组从 workout/index.html 原样复制
];

export const EMOJI_PALETTE_LOCATION = [
  // 完整数组从 workout/index.html 原样复制
];

export function emptyExtras() {
  return { mood: null, difficulty: 0, location: null, customLocation: "", note: "" };
}
```

### 5.3 `pages/gym/GymPage.jsx`

入口组件。职责：

- 套 `data-room="gym"` 包装
- 顶部 TopBar（标题"健身房"，emoji 🏋️）
- 加载 entries + custom，loading / error 处理
- 用 useState 管理当前 tab（today / log / stats / settings），URL 同步：`/gym?tab=log`
- 渲染对应 view
- 底部 4 tab 导航栏（保留原项目设计，从 components.css 的 .tab-btn 来）
- 状态变更（add/update/delete entry, custom 增删）通过 props 传给子组件

**关键变更点：**

- 移除原文件里的 `LoginScreen` 函数和 `db.auth.getSession` / `onAuthStateChange` 相关代码
- 移除 `readOnly` 状态，改用 `useAuth()` 拿 `isOwner`，传给子组件用 `disabled` 而不是局部 readOnly
- 移除原文件里的 toast 状态管理，改用 `useToast()`
- 删除手写的 LucideIcon 兼容代码

写入操作的统一模式（贯穿所有房间）：

```jsx
const { isOwner } = useAuth();
const { showToast } = useToast();

const handleAdd = async (entry) => {
  if (!isOwner) {
    showToast("只读模式，请先登录");
    return;
  }
  // ... 乐观更新 + 调 API + 失败回滚 ...
};
```

布局骨架：

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorScreen from '../../components/ErrorScreen';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Plus, Calendar, TrendingUp, Settings } from '../../icons';
import { loadEntries, loadCustom, /* ... */ } from './api';
import TodayView from './views/TodayView';
import LogView from './views/LogView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';
import EditEntryModal from './components/EditEntryModal';

export default function GymPage() {
  const { isOwner } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'today';
  const setTab = (t) => setSearchParams({ tab: t });

  const [entries, setEntries] = useState([]);
  const [custom, setCustom] = useState({ cardio: [], strength: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    Promise.all([loadEntries(), loadCustom()])
      .then(([e, c]) => { setEntries(e); setCustom(c); setLoading(false); })
      .catch(err => { setLoadError(err); setLoading(false); });
  }, []);

  // ... addEntry / updateEntryInDB / deleteEntry / addCustomPreset / removeCustomPreset / exportData / importData 全部从原文件搬过来
  // ... 改成调用 useAuth/useToast，删除原 readOnly/setReadOnly 逻辑

  if (loading) return (
    <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <LoadingScreen />
    </div>
  );

  return (
    <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <TopBar title="健身房" emoji="🏋️" />
      <div className="paper-texture max-w-md mx-auto pb-24 relative">
        <main className="px-5 pt-4">
          {loadError ? (
            <ErrorScreen error={loadError} />
          ) : (
            <>
              {tab === 'today'    && <TodayView    entries={entries} onAdd={addEntry} custom={custom} onAddCustomPreset={addCustomPreset} />}
              {tab === 'log'      && <LogView      entries={entries} onDelete={deleteEntry} onEdit={setEditingEntry} custom={custom} />}
              {tab === 'stats'    && <StatsView    entries={entries} custom={custom} />}
              {tab === 'settings' && <SettingsView custom={custom} onRemoveCustom={removeCustomPreset} onExport={exportData} onImport={importData} entryCount={entries.length} />}
            </>
          )}
        </main>

        {/* 底部 tab 栏：保留原设计 */}
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto px-5 pb-4 pt-2" style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
            <div className="flex items-center rounded-2xl p-1" style={{ background: "var(--bg-card)", border: "1px solid var(--line)" }}>
              <button className={`tab-btn ${tab === "today" ? "active" : ""}`} onClick={() => setTab("today")}>
                <Plus size={20} /><span>记录</span><span className="tab-dot" />
              </button>
              <button className={`tab-btn ${tab === "log" ? "active" : ""}`} onClick={() => setTab("log")}>
                <Calendar size={20} /><span>日志</span><span className="tab-dot" />
              </button>
              <button className={`tab-btn ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>
                <TrendingUp size={20} /><span>统计</span><span className="tab-dot" />
              </button>
              <button className={`tab-btn ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
                <Settings size={20} /><span>设置</span><span className="tab-dot" />
              </button>
            </div>
          </div>
        </nav>

        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            custom={custom}
            onAddCustomPreset={addCustomPreset}
            onSave={(patch) => updateEntryInDB(editingEntry.id, patch)}
            onCancel={() => setEditingEntry(null)}
          />
        )}
      </div>
    </div>
  );
}
```

### 5.4 拆分各 view 和组件

把原 HTML 里下列函数对应组件按文件名拆出来，**不改动业务逻辑**，只做：

- 把 `import` 补齐
- 删除手写的 LucideIcon 引用，改用 `from '../../../icons'`（注意层级）
- 把硬编码颜色 `#d9603b` / `#f4efe6` / `#fbf7ef` 等改成 `var(--accent)` / `var(--bg)` / `var(--bg-card)`
- 把硬编码 `var(--accent-2)` `var(--accent-2-soft)` 这些原本独有的变量保留（在 tokens.css 的 `[data-room="gym"]` 里加上对应定义，见下文 §5.6）
- 把 readOnly 检查改成 props.disabled 或在父组件用 isOwner 判断后再调 onAdd

| 原函数 | 新文件 |
|---|---|
| `TodayView` | `views/TodayView.jsx` |
| `LogView` | `views/LogView.jsx` |
| `StatsView` | `views/StatsView.jsx` |
| `SettingsView` | `views/SettingsView.jsx` |
| `CardioForm` | `components/CardioForm.jsx` |
| `StrengthForm` | `components/StrengthForm.jsx` |
| `ExtraFields` | `components/ExtraFields.jsx` |
| `EmojiPicker` | `components/EmojiPicker.jsx` |
| `LogItem` | `components/LogItem.jsx` |
| `EditEntryModal` | `components/EditEntryModal.jsx` |
| `StatCard` | `components/StatCard.jsx` |
| `CustomListCard` | `components/CustomListCard.jsx` |

### 5.5 删除项

源文件里这些代码**直接删除**，迁移后不再需要：

- `function App()` 整个外层（被 GymPage 替代）
- 整个 `<style>` 标签内容（搬到 components.css 和 tokens.css）
- `function LoginScreen({ authLoading, onViewOnly })` 整个登录组件
- session 状态、`db.auth.getSession()`、`onAuthStateChange` 相关
- readOnly 状态的获取和设置逻辑（变成从 useAuth 拿）
- `findLucideIcon` / `LucideIcon` / `createIcon` / 各别名（用 from '../../icons' 替代）
- toast 的 useState / setTimeout 管理（用 useToast 替代）
- `<style>` 标签内的所有 CSS（已统一在 styles/）
- 顶部 `<header>` 里的 `Daydayup` 标语和大日期数字（已被 TopBar 替代）

### 5.6 在 tokens.css 给 gym 加额外的辅助色变量

原 workout 项目里用了 `--accent-2` 和 `--accent-2-soft`（绿色辅助色，用于 strength 项目的视觉区分）。在 `tokens.css` 的 `[data-room="gym"]` 里追加：

```css
[data-room="gym"] {
  --bg: #f4efe6;
  --bg-card: #fbf7ef;
  --ink: #2a241c;
  --ink-soft: #6b6055;
  --ink-faint: #a59a8c;
  --accent: #d9603b;
  --accent-soft: #f2c9b5;
  --accent-2: #5a7a4e;          /* 新增 */
  --accent-2-soft: #c9d8c0;     /* 新增 */
  --line: #e0d6c5;
  --line-strong: #2a241c;       /* 新增（如有用到） */
}
```

### 5.7 健身房路由

只需要在 App.jsx 路由保持 `/gym/*` 即可。GymPage 内部用 `useSearchParams` 管 tab，URL 形如 `/gym?tab=log`。

---

## 六、第 3 章：书房（Study）迁移

源文件：`study/index.html`
目标位置：`src/pages/study/`
data-room: `study`
路由：`/study`（项目列表）+ `/study/:projectId`（项目详情，query param 控制 tab）

### 6.1 `pages/study/api.js`

把原 HTML 里所有 `loadProjects` / `updateProject` / `loadLogs` / `insertLog` / `deleteLog` / `loadNotes` / `insertNote` / `updateNote` / `deleteNote` / `loadModuleMeta` / `upsertModuleMeta` 函数照搬过来，import supabase。

### 6.2 `pages/study/plans.js`

把原 HTML 里的 `PROJECT_PLANS` 整个对象和 `TYPE_CONFIG` 配置搬到这里：

```js
export const PROJECT_PLANS = {
  llm: [ /* 完整内容从原 HTML 复制 */ ],
};

export const TYPE_CONFIG = {
  video: { label: "视频", color: "#b45309", bg: "#fef3c7" },
  code:  { label: "代码", color: "#0f766e", bg: "#ccfbf1" },
  read:  { label: "阅读", color: "#6d28d9", bg: "#ede9fe" },
};
```

`PROJECT_PLANS.llm` 包含 m1/m2/m3/m4 四个阶段，原样复制，**item id 不可改动**（id 一改打卡历史会失联）。

### 6.3 `pages/study/StudyPage.jsx`

入口组件，比 GymPage 复杂一点，因为有"项目列表"和"项目详情"两层。

用 React Router 的嵌套路由：

```jsx
import { Routes, Route } from 'react-router-dom';
import ProjectListView from './views/ProjectListView';
import ProjectDetailView from './views/ProjectDetailView';
import TopBar from '../../components/TopBar';

export default function StudyPage() {
  return (
    <div data-room="study" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={
          <>
            <TopBar title="书房" emoji="📚" />
            <ProjectListView />
          </>
        } />
        <Route path=":projectId" element={<ProjectDetailView />} />
      </Routes>
    </div>
  );
}
```

注意：`ProjectDetailView` 内部有自己的 ProjectHeader（顶部带"返回项目列表"按钮 + 项目信息 + 进度条），不需要 TopBar。从项目详情返回大厅需要直接 navigate 到 `/hall`。

具体来说，ProjectDetailView 顶部要有两个返回按钮：

- **大厅 →**（左上小字 mono，跳 `/hall`）
- **← 项目列表**（在 ProjectHeader 里，跳 `/study`）

或者只在最顶部用一个统一的 TopBar 显示「← 大厅」，然后 ProjectHeader 内部用一个小的「← 项目列表」按钮。我倾向于第二种（统一感更强）：

```jsx
<Route path=":projectId" element={
  <>
    <TopBar title="书房" emoji="📚" />
    <ProjectDetailView />
  </>
} />
```

ProjectDetailView 内部的「计划列表」按钮（原 HTML 里 ProjectHeader 上有这个）改成调 `navigate('/study')` 即可。

### 6.4 拆分各 view 和组件

| 原函数 | 新文件 |
|---|---|
| `App` | （删除，由 StudyPage 替代）|
| `HomePage` | `views/ProjectListView.jsx` |
| `ProjectPage` | `views/ProjectDetailView.jsx` |
| `PlanView` | `views/PlanView.jsx` |
| `NotesView` | `views/NotesView.jsx` |
| `ExtraView` | `views/ExtraView.jsx` |
| `HistoryView` | `views/HistoryView.jsx` |
| `ProjectHeader` | `components/ProjectHeader.jsx` |
| `ProjectCard` | `components/ProjectCard.jsx` |
| `ArchivedProjectCard` | `components/ArchivedProjectCard.jsx` |
| `ModuleCard` | `components/ModuleCard.jsx` |
| `StudyItem` | `components/StudyItem.jsx` |
| `NoteCard` | `components/NoteCard.jsx` |
| `SectionHeader` | `components/NoteCard.jsx` 内部小组件，或独立 |
| `BottomNav` | `components/BottomNav.jsx` |
| `Heatmap` | `components/Heatmap.jsx` |
| `TrendChart` | `components/TrendChart.jsx` |
| `CheckInModal` | `components/modals/CheckInModal.jsx` |
| `AddNoteModal` | `components/modals/AddNoteModal.jsx` |
| `EditNoteModal` | `components/modals/EditNoteModal.jsx` |
| `EditSubtitleModal` | `components/modals/EditSubtitleModal.jsx` |
| `ArchiveModal` | `components/modals/ArchiveModal.jsx` |
| `ModalShell` | `components/modals/ModalShell.jsx` |
| `CloseBtn` | `components/modals/ModalShell.jsx` 内部 |

### 6.5 ProjectDetailView 的 tab 状态

原项目用 useState 管理 tab。重构后改用 query string：

```jsx
import { useSearchParams, useParams } from 'react-router-dom';
const [searchParams, setSearchParams] = useSearchParams();
const tab = searchParams.get('tab') || 'plan';
const setTab = (t) => setSearchParams({ tab: t });
```

URL 形如 `/study/llm?tab=notes`。

### 6.6 删除项

- `function App()` 整个外层
- `function LoginScreen({ onViewOnly })` 整个登录组件
- `function GlobalStyles()` 整个内联样式组件（已统一到 styles/）
- session 状态、`db.auth.getSession`、`onAuthStateChange`
- readOnly 状态（改用 `useAuth().isOwner`）
- `findLucideIcon` / `LucideIcon` / 各图标别名
- toast 状态管理（用 useToast）
- 顶部 header 里的"Daydayup"标语和"学习日志"大标题（被 TopBar 替代）

### 6.7 颜色变量

原 study 项目主体颜色已经在 tokens.css 的 `[data-room="study"]` 里定义了。但 PROJECT_PLANS 里每个模块（m1/m2/m3/m4）有自己的 color 和 colorSoft 字段，这些是阶段自身配色，**直接保留为 hex 字符串**，不要改成变量。

### 6.8 关于 `paper-texture` 类

原 study 项目用了一个带渐变的 `.paper-texture` 类。这个类已经在 components.css 里有了（从 workout 抽出来的），但需要确保它在 study 房间也能正常工作（颜色用 `var(--accent)` 等），如果需要调整，在 components.css 里改即可，不要在 study 局部重定义。

---

## 七、第 4 章：卧室（Bedroom）迁移

源文件：`health/index.html`
目标位置：`src/pages/bedroom/`
data-room: `bedroom`
路由：`/bedroom`（阶段列表）+ `/bedroom/:phaseId`（阶段详情，query param 控制 tab）

### 7.1 `pages/bedroom/api.js`

把原 HTML 里 `loadAllLogs` / `upsertLog` / `deleteLog` 函数照搬。

### 7.2 `pages/bedroom/plans.js`

把原 HTML 里的 `PHASES`、`DAILY_ITEMS` 数组以及辅助函数 `getCalorieStatus` / `getExercisePlan` / `getCalorieTarget` / `isSaturday` / `phaseDates` 全部搬到这里。

PHASES 内容**完全保留**，包含 35天验证期 / 2026-05-06 起的所有配置：

```js
export const PHASES = [
  {
    id: "p1",
    title: "第一阶段",
    subtitle: "35天验证期",
    emoji: "🔥",
    color: "#16a34a",
    colorSoft: "#dcfce7",
    startDate: "2026-05-06",
    days: 35,
    goal: "验证在低变量、无失控放纵餐、力量+有氧都有的情况下，能不能稳定下降",
    targets: "7日均值体重 ↓1.0–2.5kg · 腰围 ↓1–3cm · 排便不变差 · 月经不变乱",
    weeklyCalories: "普通日 1300 kcal × 6 + 高热量日 1450 kcal × 1 · 周均 ~1320",
  },
];
```

DAILY_ITEMS 同样原样保留（10 个打卡项）。

### 7.3 `pages/bedroom/BedroomPage.jsx`

入口组件，结构和 StudyPage 类似（嵌套路由）：

```jsx
import { Routes, Route } from 'react-router-dom';
import HomeView from './views/HomeView';
import PhaseView from './views/PhaseView';
import TopBar from '../../components/TopBar';

export default function BedroomPage() {
  return (
    <div data-room="bedroom" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={
          <>
            <TopBar title="卧室" emoji="🛏️" />
            <HomeView />
          </>
        } />
        <Route path=":phaseId" element={
          <>
            <TopBar title="卧室" emoji="🛏️" />
            <PhaseView />
          </>
        } />
      </Routes>
    </div>
  );
}
```

PhaseView 内部有原"返回阶段列表"按钮，改成 `navigate('/bedroom')`。

### 7.4 拆分各 view 和组件

| 原函数 | 新文件 |
|---|---|
| `App` | （删除）|
| `HomePage`（在 health 里是阶段列表）| `views/HomeView.jsx` |
| `PhasePage` | `views/PhaseView.jsx` |
| `OverviewTab` | `views/OverviewTab.jsx` |
| `CheckinTab` | `views/CheckinTab.jsx` |
| `StatsTab` | `views/StatsTab.jsx` |
| `DailyItemCard` | `components/DailyItemCard.jsx` |
| `WeightChart` | `components/WeightChart.jsx` |
| `LoadingScreen` / `ErrorScreen` / `LoginScreen` | （删除，用全局版）|

### 7.5 PhaseView 的 tab 状态

```jsx
const [searchParams, setSearchParams] = useSearchParams();
const tab = searchParams.get('tab') || 'overview';
const setTab = (t) => setSearchParams({ tab: t });
```

URL 形如 `/bedroom/p1?tab=checkin`。

### 7.6 删除项

- `function App()` 整个外层
- `function LoginScreen({ onViewOnly })`
- session 状态、`db.auth.getSession`、`onAuthStateChange`
- readOnly 状态（改用 `useAuth().isOwner`）
- `findLucideIcon` / `LucideIcon` / 各图标别名
- toast 状态管理（用 useToast）
- 内联 `<style>` 标签
- 顶部 header 里的 emoji + 标题"WXH的健康日志"（被 TopBar 替代）

### 7.7 颜色变量

`tokens.css` 已经定义了 `[data-room="bedroom"]`（绿色系）。原 health 内部用到的所有 `#16a34a` / `#dcfce7` / `#f0faf0` / `#f8fcf8` / `#0f2b1a` / `#3d6b50` / `#8aac96` / `#c6e4cf` 等硬编码颜色都改成 `var(--accent)` / `var(--accent-soft)` / `var(--bg)` / `var(--bg-card)` / `var(--ink)` / `var(--ink-soft)` / `var(--ink-faint)` / `var(--line)`。

PHASES 里每个阶段的 color/colorSoft 字段保留为 hex（这是数据，不是主题色）。

特殊颜色保留 hex（这些是语义颜色，不依赖房间）：

- `#ef4444` — 超热量警告红
- `#eab308` — 热量过低警告黄
- `#dc2626` — 严重警告
- `#d97706` — 中度警告

---

## 八、第 5 章：路由总配置

更新后的 `src/App.jsx`：

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import HallPage from './pages/HallPage';
import GymPage from './pages/gym/GymPage';
import StudyPage from './pages/study/StudyPage';
import BedroomPage from './pages/bedroom/BedroomPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/hall" element={<AuthGuard><HallPage /></AuthGuard>} />
            <Route path="/gym/*" element={<AuthGuard><GymPage /></AuthGuard>} />
            <Route path="/study/*" element={<AuthGuard><StudyPage /></AuthGuard>} />
            <Route path="/bedroom/*" element={<AuthGuard><BedroomPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
```

---

## 九、第 6 章：大厅卡片预览数据

P0 阶段 RoomCard 的 preview 字段是空的。本章给三个房间分别实现一个 preview hook，给大厅卡片填充实际数据。

### 9.1 `hooks/useGymPreview.js`

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export function useGymPreview() {
  const [preview, setPreview] = useState(undefined); // undefined = loading, null = no data

  useEffect(() => {
    supabase
      .from("workout_entries")
      .select("id, data")
      .order("id", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) { setPreview(null); return; }
        if (!data || data.length === 0) { setPreview(null); return; }
        const entry = data[0].data;
        const dateLabel = formatDate(entry.date);
        const detail = entry.type === 'cardio'
          ? `${entry.name} ${entry.duration}min`
          : `${entry.name} ${entry.sets}×${entry.reps}`;
        setPreview(`上次训练 · ${dateLabel} ${detail}`);
      });
  }, []);

  return preview;
}
```

### 9.2 `hooks/useStudyPreview.js`

按你的要求，显示三种状态之一：

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { todayStr, daysBetween } from '../lib/utils';

export function useStudyPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    supabase
      .from("study_logs")
      .select("date")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setPreview(null); return; }
        if (!data || data.length === 0) { setPreview("还没开始记录"); return; }

        const today = todayStr();
        const todayLogs = data.filter(l => l.date === today);
        if (todayLogs.length > 0) {
          setPreview(`今日已打卡 · ${todayLogs.length} 项`);
          return;
        }

        const lastDate = data[0].date;
        const days = daysBetween(lastDate, today);
        if (days === 1) setPreview("上次打卡 · 昨天");
        else if (days < 7) setPreview(`上次打卡 · ${days}天前`);
        else setPreview(`已停滞 ${days} 天`);
      });
  }, []);

  return preview;
}
```

### 9.3 `hooks/useBedroomPreview.js`

显示"今日是否已记录"：

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { todayStr, daysBetween } from '../lib/utils';

export function useBedroomPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    const today = todayStr();
    supabase
      .from("health_logs")
      .select("date")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setPreview(null); return; }
        if (!data || data.length === 0) { setPreview("还没开始记录"); return; }

        if (data.some(l => l.date === today)) {
          setPreview("今日已记录 ✓");
          return;
        }

        const lastDate = data[0].date;
        const days = daysBetween(lastDate, today);
        if (days === 1) setPreview("昨天有记录");
        else setPreview(`已 ${days} 天未记录`);
      });
  }, []);

  return preview;
}
```

### 9.4 `pages/HallPage.jsx` 改造

在大厅页面里调用三个 hook，把结果传给 RoomCard：

```jsx
import { useGymPreview } from '../hooks/useGymPreview';
import { useStudyPreview } from '../hooks/useStudyPreview';
import { useBedroomPreview } from '../hooks/useBedroomPreview';

export default function HallPage() {
  const gymPreview = useGymPreview();
  const studyPreview = useStudyPreview();
  const bedroomPreview = useBedroomPreview();

  const ROOMS = [
    { id: 'gym',     /* ... */ preview: gymPreview     },
    { id: 'study',   /* ... */ preview: studyPreview   },
    { id: 'bedroom', /* ... */ preview: bedroomPreview },
  ];

  // ... 渲染
}
```

### 9.5 `components/RoomCard.jsx` 渲染规则

```jsx
{preview === undefined ? (
  // 加载中：灰色横线骨架
  <div style={{ height: 12, width: '60%', background: 'var(--line)', borderRadius: 4, opacity: 0.6 }} />
) : preview === null ? (
  // 加载失败：留白
  <div style={{ height: 12 }} />
) : (
  // 正常显示
  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{preview}</span>
)}
```

---

## 十、第 7 章：完整验收清单

### 10.1 共通验收

1. ☐ `npm install` 后 `npm run dev` 正常启动
2. ☐ `npm run build` 通过，dist/ 输出正常
3. ☐ 未登录访问任意房间路由都跳回 `/`
4. ☐ 登录后能正常进入大厅
5. ☐ 大厅 3 张卡片能显示各自的预览数据（上次训练/打卡状态/今日是否记录）
6. ☐ 大厅卡片预览加载中显示骨架，加载完显示数据，无数据时不报错
7. ☐ 三个房间的主题色切换正常
8. ☐ 任意房间内点 TopBar「← 大厅」能返回大厅，配色变回中性
9. ☐ 访客模式下进入任意房间，所有写入操作都被拦截并显示「只读模式，请先登录」toast

### 10.2 健身房（Gym）验收

10. ☐ Today tab：能选有氧/无氧，填写后保存成功
11. ☐ Today tab：自定义新项目/新动作能保存成预设
12. ☐ Today tab：心情、难度、场地、笔记 5 个 extra 字段都能填写
13. ☐ Today tab：自定义新场地能保存成预设
14. ☐ Log tab：能筛选有氧/无氧，按日期分组显示
15. ☐ Log tab：移动端左滑显示删除/编辑按钮
16. ☐ Log tab：编辑某条记录后能正常更新
17. ☐ Log tab：删除某条记录后从列表移除
18. ☐ Stats tab：所有统计卡片正常显示（次数、活跃天、连续打卡、最长记录、有氧无氧比例、30天热力图、心情分布、平均难度、场地分布、每项运动分解）
19. ☐ Settings tab：自定义有氧/无氧/场地的预设可以列出、可以单独移除
20. ☐ Settings tab：导出 JSON 文件正常下载
21. ☐ Settings tab：导入 JSON 文件能合并新记录（不覆盖现有）

### 10.3 书房（Study）验收

22. ☐ 项目列表页：进行中的项目显示在上，已归档的折叠在下
23. ☐ 项目列表页：每个 ProjectCard 显示进度条、完成数、最近打卡时间
24. ☐ 项目详情页：顶部 ProjectHeader 显示进度、距离上次学习的天数、待解决难点数
25. ☐ 项目详情页：4 个 tab（计划/难点本/额外/记录）切换正常
26. ☐ Plan tab：模块可折叠展开，每个 item 能打卡/撤销打卡/添加难点
27. ☐ Plan tab：模块时间副标题能编辑（保存到 study_module_meta）
28. ☐ Plan tab：item 上的"今日已打卡"和"待解决难点数"标签正常显示
29. ☐ Notes tab：待解决/已解决两组分开显示
30. ☐ Notes tab：能编辑、解决、重新打开、删除难点
31. ☐ Extra tab：能添加额外学习记录（指定日期）
32. ☐ Extra tab：按日期分组显示
33. ☐ History tab：30天热力图正常显示
34. ☐ History tab：14天打卡趋势折线图正常显示
35. ☐ History tab：完整打卡历史按日期分组显示，能删除单条
36. ☐ 全部任务完成后能看到「归档计划」按钮，点击能写总结并归档
37. ☐ 已归档项目能恢复

### 10.4 卧室（Bedroom）验收

38. ☐ 阶段列表页：第一阶段卡片正常显示（35天验证期、目标、进度条、起止日期）
39. ☐ 阶段详情页：3 个 tab（计划总览/每日打卡/统计）切换正常
40. ☐ Overview tab：35天日历按周分组显示，热量颜色规则正确（绿/红/黄/灰）
41. ☐ Overview tab：每周显示超标/过低天数提示
42. ☐ Overview tab：每周运动建议表正常显示
43. ☐ Checkin tab：日期导航（前/后/回到今天）正常
44. ☐ Checkin tab：当天的运动建议、热量目标正常显示
45. ☐ Checkin tab：10 个打卡项（起床、体重、维生素D、铁剂、运动、热量、排便、饥饿、疲劳、睡觉）都能填写
46. ☐ Checkin tab：热量字段的颜色实时反馈（红/黄/绿）正常
47. ☐ Checkin tab：运动子表单（类型、时长、消耗、心率）能填写
48. ☐ Checkin tab：备注框能填写
49. ☐ Checkin tab：保存后页面状态正确更新
50. ☐ Stats tab：体重变化卡片显示起始/最新/变化/7日均值，包含 mini 折线图
51. ☐ Stats tab：日均摄入、日均运动消耗、总运动时长、打卡率正常计算
52. ☐ Stats tab：吃药记录（维生素D/铁剂）天数正常
53. ☐ Stats tab：身体信号（饥饿、疲劳均值；排便统计）正常

---

## 十一、不要做的事

- **不要修改任何业务逻辑、计算公式、UI 交互细节**——保留原项目的全部行为
- **不要修改 PROJECT_PLANS、PHASES、DAILY_ITEMS、CARDIO_PRESETS 等数据常量**
- **不要修改数据库表结构或字段名**
- **不要重新实现 LucideIcon 的兼容代码**（必须用 lucide-react@0.292.0 直接导入）
- **不要给任何房间用 v4 Tailwind 的写法**
- **不要在颜色上随意发挥**——只把硬编码颜色映射到对应 CSS 变量；保留特殊语义颜色（红/黄警告色）
- **不要修改原 workout/、study/、health/ 目录里的内容**——保持线上版本可用
- **不要在大厅、登录页、TopBar 引入鸡汤口号**

---

## 十二、提交时

完成后请告诉我：

1. 创建/修改了哪些文件（按章节列出）
2. 测试时的截图，至少包含：
   - 大厅（带 3 张房间卡片，能看到 preview 数据）
   - 健身房 4 个 tab 各一张
   - 书房项目列表 + 项目详情 4 个 tab 各一张
   - 卧室阶段列表 + 阶段详情 3 个 tab 各一张
3. 哪些验收项打了勾，哪些没打勾及原因
4. 如果迁移过程中遇到原 HTML 里的代码有 bug 或矛盾，**先停下来问我**，不要自己改业务逻辑

如果在执行过程中发现指令不清晰或互相矛盾，请先停下来问我。
