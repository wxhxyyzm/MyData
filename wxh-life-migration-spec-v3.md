# wxh的电子生存数据 — 房间迁移完整文档 v3

> 这份文档承接 P0（骨架已搭好）。本任务把三个原 HTML 项目的全部业务逻辑、UI、组件、统计图表迁移到 Vite+React 项目里，并完成 UI 统一。
> **一次性迁移三个房间，必须功能 100% 对齐，不允许"先简化后完善"。**

---

## ⚠️ 头等重要原则（请在动手前完整阅读）

### 原则 1：迁移 = 逐字搬运 JSX + 仅做规定的替换

这次任务的本质是 **代码搬家**，不是 **重新实现**。

每一段从原 HTML 搬到新文件的 JSX、useState、useMemo、handler、计算逻辑，**必须逐字保留**，只允许做下面这几种规定动作的替换：

| 替换项 | 原代码 | 新代码 |
|---|---|---|
| 图标 | `<Plus size={20} />`（来自手写 LucideIcon） | `<Plus size={20} />`（来自 `import { Plus } from '../../../icons'`） |
| 数据库调用 | `db.from(...)` 内联 | 调用 `import { ... } from './api'` 里的函数 |
| 颜色（房间主题色） | `#d9603b` `#f4efe6` 等硬编码 | `var(--accent)` `var(--bg)` 等语义变量 |
| 颜色（特殊语义色）| `#ef4444` `#eab308` 等 | **保留 hex 不变** |
| Toast | 局部 `setToast()` | `useToast().showToast()` |
| 写权限检查 | 局部 `readOnly` 变量 | `useAuth().isOwner` 取反 |
| 登录组件 | `LoginScreen` 内联组件 | **删除整段**，已被 LoginPage 统一 |
| Session 管理 | `db.auth.getSession`、`onAuthStateChange` | **删除整段**，AuthProvider 已处理 |
| 底部 Tab 栏 | 各房间各自的 nav 实现 | 统一调用 `<BottomTabBar tabs={...} />` 共享组件 |
| Input | 各房间不同样式 | 统一极简下划线（见第六章） |

除此之外的所有内容**不得修改、不得简化、不得"看起来差不多就行"**。

### 原则 2：禁止"我觉得这部分用不上"

执行过程中，如果遇到某段 useMemo 看起来很复杂、某个组件看起来在新结构下"用不到"、某段统计算法你不理解 —— **不要省略**，原样搬过来。这是个人项目，每一行都是用户精心设计的。

如果实在判断不了某段代码的作用、或者看到代码自相矛盾，**停下来问，不要自己拍板**。

### 原则 3：现有不完整版本的处理方式

当前 wxh-life 项目已经有一版迁移成果，但功能不完整（比如统计页面缺失、底部 tab 不统一）。本次任务的**正确做法**：

- **不是**完全推倒重来
- **而是**对照本文档，逐章节逐项**补齐和修正**现有代码

具体步骤：

1. 先读原 HTML（`workout/index.html`、`study/index.html`、`health/index.html`）和本文档第七~十章，**对照现有 src/pages/ 下的代码**，列出"缺失"和"不一致"的清单
2. 根据清单逐项补齐
3. 完成后用第十二章的 53 项验收清单 + 行数粗校验做完整性确认

如果现有代码与本文档的目录结构不一致（比如把 view 文件命名成别的），按本文档的目录重组。

### 原则 4：验收时按"组件清单 + 行数粗校验"双重检查

每个 view 文件搬完之后，对比原 HTML 里对应函数的代码行数。如果新文件比原函数少了 30% 以上，几乎可以肯定是漏功能了，必须回去补全。

---

## 一、前置确认

开始之前确认 P0 已完成：

1. ☐ 项目根目录是 `wxh-life/`，可以 `npm run dev` 启动
2. ☐ 登录、大厅、三个空房间（或部分迁移过的房间）都能正常显示，主题色切换正常
3. ☐ `useAuth` / `useToast` / `AuthGuard` / `TopBar` / `RoomCard` 都已实现
4. ☐ tokens.css / components.css 三层令牌系统正常工作

如果 P0 还有问题，先回去解决再开始这一步。

---

## 二、本次任务目标

**目标 = 三个原 HTML 的全部功能在新项目里 100% 复现 + 跨房间 UI 统一。**

具体保留范围（一字不少）：

### 健身房（workout/index.html，约 1300 行）

- 4 个 tab：**记录、日志、统计、设置**
- 记录 tab：有氧/无氧切换、自定义新项目、心情/难度/场地/笔记 5 个 extra 字段
- 日志 tab：按日期分组、左滑删除、编辑模态框、备注展开收起
- 统计 tab：训练次数、活跃天、有氧时长、总卡路里、当前/最长连续、有氧无氧比例、30天活跃热力图、心情分布、平均难度、场地分布、按运动项目分解（3 种排序）
- 设置 tab：数据条数 + 导入/导出 JSON、自定义有氧预设管理、自定义无氧预设管理、自定义场地管理、关于
- EmojiPicker 组件（点击当前 emoji 弹出调色板）

### 书房（study/index.html，约 1700 行）

- 项目列表页：进行中项目卡片（带进度条、最近打卡时间）、已归档项目折叠区、归档恢复按钮
- 项目详情页：ProjectHeader（含距离上次学习多少天的紧急程度提示、待解决难点数、全部完成时的归档按钮）
- 4 个 tab：**计划、难点本、额外、记录**
- 计划 tab：模块卡片（可折叠展开）、模块时间副标题（可点击编辑）、StudyItem（打卡圈/类型标签/今日已打卡/待解决数标签/外链/加难点）
- 难点本 tab：待解决/已解决两组、NoteCard（解决方案绿色框、编辑/删除/标记解决）
- 额外 tab：按日期分组的额外学习记录、添加按钮
- 记录 tab：摘要数据卡片、**90天热力图（按周分组的 SVG）**、**14天打卡趋势折线图（SVG）**、完整打卡历史按日期分组
- 5 个 modal：CheckInModal、AddNoteModal、EditNoteModal、EditSubtitleModal、ArchiveModal

### 卧室（health/index.html，约 1100 行）

- 阶段列表页：第一阶段卡片（emoji/标题/目标/进度条/起止日期/打卡天数）
- 阶段详情页：3 个 tab：**计划总览、每日打卡、统计**
- 计划总览 tab：目标/热量安排卡片、颜色图例、35 天日历按周分组（5 周）、热量颜色规则（红/黄/绿/灰）、每周超标/过低提示、每周运动建议
- 每日打卡 tab：日期前后导航、回到今天、当日运动建议+热量目标、10 个打卡项 + 备注
- 10 个打卡项：起床时间(time)、体重(number)、维生素D(check)、铁剂(check)、运动(exercise 子表单)、热量摄入(number 带颜色反馈)、排便(select)、饥饿感(slider)、疲劳感(slider)、睡觉时间(time)
- 运动子表单：类型/时长/消耗/心率
- 统计 tab：体重变化卡片（起始/最新/变化/7日均值 + mini 折线图 SVG）、日均摄入、日均运动消耗、总运动时长、打卡率、吃药记录、身体信号（饥饿/疲劳均值、排便分布）

---

## 三、第三个房间从「客厅」改为「卧室」

`living` → `bedroom`：

- `data-room="bedroom"`
- 路由 `/bedroom`
- 文件夹 `pages/bedroom/`
- 文件 `BedroomPage.jsx`
- 大厅 ROOMS：id `bedroom`、name `卧室`、subtitle `Bedroom`、emoji `🛏️`
- 颜色保持绿色不变

---

## 四、目录结构（最终）

```
wxh-life/
├── src/
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useToast.js
│   │   ├── useGymPreview.js
│   │   ├── useStudyPreview.js
│   │   └── useBedroomPreview.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── components.css
│   │   └── global.css
│   ├── components/
│   │   ├── AuthGuard.jsx
│   │   ├── RoomCard.jsx
│   │   ├── TopBar.jsx
│   │   ├── BottomTabBar.jsx        ← 新增：跨房间共享
│   │   ├── ToastContainer.jsx
│   │   ├── LoadingScreen.jsx
│   │   └── ErrorScreen.jsx
│   ├── icons/
│   │   └── index.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── HallPage.jsx
│   │   ├── gym/
│   │   │   ├── GymPage.jsx
│   │   │   ├── api.js
│   │   │   ├── presets.js
│   │   │   ├── views/
│   │   │   │   ├── TodayView.jsx
│   │   │   │   ├── LogView.jsx
│   │   │   │   ├── StatsView.jsx
│   │   │   │   └── SettingsView.jsx
│   │   │   └── components/
│   │   │       ├── CardioForm.jsx
│   │   │       ├── StrengthForm.jsx
│   │   │       ├── ExtraFields.jsx
│   │   │       ├── EmojiPicker.jsx
│   │   │       ├── LogItem.jsx
│   │   │       ├── EditEntryModal.jsx
│   │   │       ├── StatCard.jsx
│   │   │       └── CustomListCard.jsx
│   │   ├── study/
│   │   │   ├── StudyPage.jsx
│   │   │   ├── api.js
│   │   │   ├── plans.js
│   │   │   ├── views/
│   │   │   │   ├── ProjectListView.jsx
│   │   │   │   ├── ProjectDetailView.jsx
│   │   │   │   ├── PlanView.jsx
│   │   │   │   ├── NotesView.jsx
│   │   │   │   ├── ExtraView.jsx
│   │   │   │   └── HistoryView.jsx
│   │   │   └── components/
│   │   │       ├── ProjectCard.jsx
│   │   │       ├── ArchivedProjectCard.jsx
│   │   │       ├── ProjectHeader.jsx
│   │   │       ├── ModuleCard.jsx
│   │   │       ├── StudyItem.jsx
│   │   │       ├── NoteCard.jsx
│   │   │       ├── Heatmap.jsx
│   │   │       ├── TrendChart.jsx
│   │   │       └── modals/
│   │   │           ├── ModalShell.jsx
│   │   │           ├── CheckInModal.jsx
│   │   │           ├── AddNoteModal.jsx
│   │   │           ├── EditNoteModal.jsx
│   │   │           ├── EditSubtitleModal.jsx
│   │   │           └── ArchiveModal.jsx
│   │   └── bedroom/
│   │       ├── BedroomPage.jsx
│   │       ├── api.js
│   │       ├── plans.js
│   │       ├── views/
│   │       │   ├── HomeView.jsx
│   │       │   ├── PhaseView.jsx
│   │       │   ├── OverviewTab.jsx
│   │       │   ├── CheckinTab.jsx
│   │       │   └── StatsTab.jsx
│   │       └── components/
│   │           ├── DailyItemCard.jsx
│   │           └── WeightChart.jsx
```

注意：之前 study 项目里有 `components/BottomNav.jsx`，本版改为统一使用根 `components/BottomTabBar.jsx`，**study 自己的 BottomNav.jsx 删除**。

---

## 五、UI 统一规范（核心章节，必须严格遵守）

之前三个 HTML 各自的 tab 栏、card、input 高度颜色风格不一致，本次必须做到三个房间在视觉上**完全统一**，让用户在房间间切换只感觉到主题色变化、布局节奏完全一致。

### 5.1 底部 Tab 栏（强制统一，提取为 `components/BottomTabBar.jsx`）

**这是本次最关键的统一项。** 三个原项目里底部 tab 高度、字号、padding 都不同，必须改成完全一致。

#### 视觉规格（像素级，不容偏差）

```
外层 nav:
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;

容器（在 nav 内）:
  max-width: 480px (max-w-md); 居中
  padding: 8px 20px 16px;  /* 上 8 / 左右 20 / 下 16 */
  background: linear-gradient(to top, var(--bg) 70%, transparent);

内层胶囊（实际 tab 容器）:
  display: flex; align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 4px;

每个 tab 按钮 (.tab-btn):
  flex: 1;
  height: 56px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-faint);
  cursor: pointer;
  border-radius: 12px;
  transition: color 0.15s ease, background 0.15s ease;
  position: relative;

  /* 图标：固定 size={20} */
  /* label 文字：font-size 11px */

active 状态 (.tab-btn.active):
  color: var(--accent);
  /* 不变背景，只改文字和图标颜色 */

active 指示点 (.tab-dot):
  width: 4px; height: 4px;
  border-radius: 50%;
  background: transparent;
  position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);

.tab-btn.active .tab-dot:
  background: var(--accent);

badge（数字徽标，仅用于难点本 tab）:
  position: absolute; top: 6px; right: calc(50% - 22px);
  background: #dc2626;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
  font-family: var(--font-mono);
```

#### `components/BottomTabBar.jsx` 实现

```jsx
export default function BottomTabBar({ tabs, active, onChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      pointerEvents: 'none',
    }}>
      <div style={{
        maxWidth: 480, margin: '0 auto',
        padding: '8px 20px 16px',
        background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
        pointerEvents: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: 4,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${active === t.id ? 'active' : ''}`}
              onClick={() => onChange(t.id)}
            >
              <t.Icon size={20} strokeWidth={2} />
              <span>{t.label}</span>
              <span className="tab-dot" />
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 'calc(50% - 22px)',
                  background: '#dc2626', color: 'white',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 5px', borderRadius: 999,
                  minWidth: 16, textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

`.tab-btn` 和 `.tab-dot` 类的实际样式定义在 `components.css` 里，使用上述像素值。

#### `components.css` 里 .tab-btn 的最终样式

```css
.tab-btn {
  flex: 1;
  height: 56px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-faint);
  cursor: pointer;
  border-radius: 12px;
  transition: color 0.15s ease;
  position: relative;
}
.tab-btn.active {
  color: var(--accent);
}
.tab-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: transparent;
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  transition: background 0.15s ease;
}
.tab-btn.active .tab-dot {
  background: var(--accent);
}
```

#### 三个房间的 tab 配置

**健身房（GymPage 内部）：**

```jsx
import { Plus, Calendar, TrendingUp, Settings } from '../../icons';
const tabs = [
  { id: 'today',    Icon: Plus,        label: '记录' },
  { id: 'log',      Icon: Calendar,    label: '日志' },
  { id: 'stats',    Icon: TrendingUp,  label: '统计' },
  { id: 'settings', Icon: Settings,    label: '设置' },
];
<BottomTabBar tabs={tabs} active={tab} onChange={setTab} />
```

**书房（ProjectDetailView 内部，仅项目详情页有）：**

```jsx
import { Layers, Lightbulb, Sparkles, Calendar } from '../../icons';
const tabs = [
  { id: 'plan',    Icon: Layers,    label: '计划' },
  { id: 'notes',   Icon: Lightbulb, label: '难点本', badge: unresolvedCount },
  { id: 'extra',   Icon: Sparkles,  label: '额外' },
  { id: 'history', Icon: Calendar,  label: '记录' },
];
<BottomTabBar tabs={tabs} active={tab} onChange={setTab} />
```

**卧室（PhaseView 内部，仅阶段详情页有）：**

```jsx
import { ClipboardList, Calendar, BarChart3 } from '../../icons';
const tabs = [
  { id: 'overview', Icon: ClipboardList, label: '计划总览' },
  { id: 'checkin',  Icon: Calendar,      label: '每日打卡' },
  { id: 'stats',    Icon: BarChart3,     label: '统计' },
];
<BottomTabBar tabs={tabs} active={tab} onChange={setTab} />
```

#### 重要

- **三个房间必须用同一个 `BottomTabBar` 组件**，不许各自再定义一份
- `tab-btn` 的 active 颜色用 `var(--accent)`，自动跟随房间主题色
- 高度统一 56px（不算外层 padding），整体可视高度 80px 左右

### 5.2 内容区底部 padding（避免被 tab 栏遮挡）

由于 tab 栏 fixed 在底部，每个房间的主内容容器底部必须留出空间：

```jsx
<div className="max-w-md mx-auto" style={{ paddingBottom: 100 }}>
  <main className="px-5 pt-4">
    {/* tab 内容 */}
  </main>
</div>
```

`paddingBottom: 100` 是固定值，所有房间用同一个值。

### 5.3 Card 统一样式

`.card` 类在 `components.css` 中的最终定义：

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 18px;          /* 三个房间统一 18px */
  transition: box-shadow 0.15s ease;
}
```

padding 不在 .card 里指定，由各组件根据内容用 inline style 或 utility class 自定（这一点保留灵活性）。

### 5.4 Input 统一为「极简下划线」风格（A 方案）

**所有三个房间的输入框统一为下面这种风格：**

```css
.input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid var(--line);
  padding: 10px 0;
  font-size: 16px;
  font-family: var(--font-body);
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease;
}
.input:focus {
  border-color: var(--accent);
}

/* textarea 例外：因为多行不适合下划线，用完整边框 */
textarea.input {
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  resize: vertical;
}
textarea.input:focus {
  border-color: var(--accent);
}
```

#### 替换规则

原 health（卧室）项目里所有 `<input>` 都是实心边框样式（`border: 1.5px solid; background: var(--bg-card); border-radius: 12px; padding: 12px 16px;`）。**迁移时一律改成 `.input` 类**，不再写 inline 样式。

唯一例外：

- `<input type="time">` 和 `<input type="date">` 在 health 里有特殊样式，统一后也用 `.input` 类即可（time/date 的浏览器默认控件略有不同，但下划线样式都能正常工作）
- LoginPage 的输入框是登录卡片专用样式，**不变**（这是登录页特例，跟"房间内 input"不算一类）

### 5.5 按钮统一

`.btn-primary` 和 `.btn-ghost` 在 `components.css` 中的最终定义：

```css
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: transform 0.1s ease;
}
.btn-primary:active {
  transform: scale(0.98);
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: border-color 0.15s ease, transform 0.1s ease;
}
.btn-ghost:hover {
  border-color: var(--ink);
}
.btn-ghost:active {
  transform: scale(0.98);
}
```

按下都用 `scale(0.98)`，过渡 0.1s。**不要使用 translateY，三个房间统一**。

### 5.6 Chip 统一

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg-card);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.15s ease;
}
.chip:hover {
  border-color: var(--ink);
}
.chip.active {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
```

三个房间所有的"快速选择按钮"（如运动预设、筛选器、场地选择）都用 `.chip` 类。

### 5.7 Toast 统一

继续使用 P0 阶段的全局 useToast。toast 视觉规格：

```css
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ink);
  color: var(--bg);
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  white-space: nowrap;
}
```

⚠️ 注意 `bottom: 100px` 是为了避开底部 tab 栏。

### 5.8 房间页面布局骨架（三个房间统一）

每个房间页面的外层结构必须遵循：

```jsx
<div data-room="{room}" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
  <TopBar title="{房间名}" emoji="{emoji}" />

  <div className="max-w-md mx-auto" style={{ paddingBottom: 100 }}>
    <main className="px-5 pt-4">
      {/* 当前 tab 的 view */}
    </main>
  </div>

  <BottomTabBar tabs={...} active={tab} onChange={setTab} />

  {/* 任何 modal */}
</div>
```

#### 关于 `.paper-texture` 类

原 workout 项目用了纸质纹理装饰。**保留这个类，但只在 gym 房间使用**。study 和 bedroom 不加。

### 5.9 房间内"列表页二级标题"保留规则

- **健身房**：列表页就是"记录" tab，不需要二级标题
- **书房项目列表页**：保留"Daydayup"小字 + "学习日志"大标题（HomePage 顶部那段）
- **卧室阶段列表页**：保留 🌿 emoji + "WXH的健康日志" 标题（HomePage 顶部那段）

虽然 TopBar 已经显示了房间名，但这些二级标题是"页面正文的开场白"，跟 TopBar 的"导航定位"职能不同，保留它们。

### 5.10 不能再出现的 UI 模式

执行检查时，下列模式如果出现在新代码里就是不合规：

- ❌ 任何房间内的底部 nav 不是用 `BottomTabBar` 组件
- ❌ tab 栏高度三个房间不一致
- ❌ tab label 字号三个房间不一致
- ❌ 三个房间用了不同样式的 input（实心 vs 下划线）
- ❌ 任何按钮按下用 `translateY`
- ❌ 在房间内重新定义 `.tab-btn` `.card` `.input` 等类

---

## 六、第 1 章：共享工具与图标

### 6.1 `lib/utils.js`

确保包含以下函数（参考三个原 HTML，签名统一）：

```js
export function genId() { return Date.now() * 1000 + Math.floor(Math.random() * 1000); }
export function todayStr() { /* YYYY-MM-DD */ }
export function formatDate(str) { /* "5月7日" */ }
export function formatDateShort(str) { /* "05-07"，gym 项目用 */ }
export function relativeDate(isoStr) { /* "今天/昨天/3天前/2周前/5/3" */ }
export function daysBetween(a, b) { /* b - a 整数天 */ }
export function getWeekday(str) { /* "周一"等 */ }
```

### 6.2 `icons/index.js`

```js
export {
  X, Check, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Calendar, Clock, Settings, Download,
  Flame, Dumbbell, Heart, TrendingUp,
  Archive, Trophy, Layers, Lightbulb, Sparkles,
  AlertCircle, CheckCircle2,
  Sun, Moon, Pill, Scale, ClipboardList, BarChart3,
  LogOut,
} from 'lucide-react';
```

### 6.3 删除的代码

三个原 HTML 中以下整段代码**全部删除**，迁移后用 import 替代：

```js
// 整段 findLucideIcon 函数 — 删除
function findLucideIcon(name) { ... }

// 整段 LucideIcon 组件 — 删除
const LucideIcon = ({ name, size, ... }) => { ... };

// 整段 createIcon 函数（workout 用了）— 删除
const createIcon = (name) => { ... };

// 这一组逐个图标别名 — 删除（改成 import { X, Check, ... } from 'icons'）
const X = (p) => <LucideIcon name="x" {...p} />;
// ...

// 整段 LoginScreen 组件 — 删除
function LoginScreen({ onViewOnly }) { ... }

// session/auth 监听 — 删除
db.auth.getSession().then(...);
db.auth.onAuthStateChange(...);

// readOnly 状态 — 删除（用 useAuth().isOwner 替代）
const [readOnly, setReadOnly] = useState(false);

// toast 状态管理 — 删除（用 useToast 替代）
const [toast, setToast] = useState(null);

// 内联 <style> 标签和 GlobalStyles — 删除（已统一到 styles/）

// 各房间自己定义的 BottomNav 组件 — 删除（用 BottomTabBar）
function BottomNav({ tab, setTab, ... }) { ... }
```

---

## 七、第 2 章：健身房（Gym）逐字迁移

源文件：`workout/index.html`（约 1300 行）

### 7.1 Step 1：读源文件

完整阅读 `workout/index.html`。注意：

- 文件里所有 `function XxxView()` 和 `function XxxForm()` 是 view/component
- 所有以 `async function` 开头的（loadEntries 等）是数据库 API
- 所有顶级 `const XXX_PRESETS = [...]` 是数据常量
- `function App()` 是入口（会被 `GymPage.jsx` 替代）
- `function LoginScreen` 在最底下（删除）

### 7.2 Step 2：抽 api.js

把以下 6 个函数原样搬到 `pages/gym/api.js`，加上 `import { supabase } from '../../lib/supabase'` 和 `import { genId } from '../../lib/utils'`：

- `loadEntries`
- `insertEntry`
- `updateEntry`
- `deleteEntryById`
- `loadCustom`
- `saveCustom`

### 7.3 Step 3：抽 presets.js

把以下常量原样搬到 `pages/gym/presets.js`：

- `CARDIO_PRESETS`
- `STRENGTH_PRESETS`
- `MOOD_OPTIONS`
- `DEFAULT_LOCATION_PRESETS`
- `EMOJI_PALETTE_EXERCISE`（这是个长数组，必须完整复制）
- `EMOJI_PALETTE_LOCATION`（同上）
- `function emptyExtras()` 函数

### 7.4 Step 4：拆 view 和 component

下表里每个新文件，**对应原 HTML 的某个函数，必须把那个函数的完整 JSX、state、handler 全部搬过去**：

| 新文件 | 对应原函数 | 关键功能（必须保留） |
|---|---|---|
| `views/TodayView.jsx` | `TodayView` | 今日训练摘要卡片（次数/分钟/卡路里/次数）+ 有氧/无氧 mode 切换 + CardioForm/StrengthForm 渲染 |
| `views/LogView.jsx` | `LogView` | 全部/有氧/无氧筛选 chip + 按日期分组 + LogItem 列表 + 空状态 |
| `views/StatsView.jsx` | `StatsView` | **全部 11 个统计区块**，见下方详述 |
| `views/SettingsView.jsx` | `SettingsView` | 数据卡片（条数+导入导出）+ 3 个 CustomListCard（有氧/无氧/场地）+ 关于卡片 |
| `components/CardioForm.jsx` | `CardioForm` | 项目预设选择 + 自定义新项目（带 EmojiPicker）+ 时长/卡路里/日期 + ExtraFields |
| `components/StrengthForm.jsx` | `StrengthForm` | 动作预设选择 + 自定义新动作 + 组数/次数/日期 + ExtraFields |
| `components/ExtraFields.jsx` | `ExtraFields` | 心情 4 选 + 难度 5 星 + 场地选择（含自定义新场地）+ 笔记折叠区 |
| `components/EmojiPicker.jsx` | `EmojiPicker` | 点击当前 emoji 弹出网格选择面板，外部点击关闭 |
| `components/LogItem.jsx` | `LogItem` | 左滑删除/编辑、备注展开收起、桌面 hover 显示按钮、二次点击确认删除 |
| `components/EditEntryModal.jsx` | `EditEntryModal` | 编辑现有记录的全字段（带 ExtraFields） |
| `components/StatCard.jsx` | `StatCard` | 统计小卡片，支持 accent 模式 |
| `components/CustomListCard.jsx` | `CustomListCard` | 自定义预设列表卡片，支持移除 |

#### StatsView.jsx 必须包含的 11 个统计区块

逐一核对，每个必须存在：

1. **Hero 数据网格**（4 个 StatCard）：训练次数、活跃天数、有氧时长、总卡路里
2. **连续打卡卡片组**（2 个）：当前连续 + 最长记录
3. **有氧 / 无氧比例条**：水平比例条 + 上下计数
4. **30 天活跃热力图**：15 列网格，颜色按强度，含颜色图例
5. **心情分布**：4 行小条形图（按心情分组）
6. **平均难度卡片**：大数字 + 5 星图 + "基于 N 次评分"
7. **运动场地分布**：圆角胶囊样式的列表，含百分比
8. **运动项目分解（核心区块）**：
   - 排序切换 tab（按次数 / 按时长次数 / 按最近）
   - 每个运动一行：图标 + 名称 + 类型 badge + 大次数 + 进度条 + 详细统计（总时长/总卡路里/平均/上次时间）
9. **日期范围副标题**：起始日期 → 今天 · 共 N 天
10. **空状态**：没数据时显示「还没有数据」

useMemo 里的 `stats` 计算逻辑非常复杂（200+ 行），**必须完整搬运，不要简化任何字段**。

### 7.5 Step 5：写 GymPage.jsx

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import BottomTabBar from '../../components/BottomTabBar';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorScreen from '../../components/ErrorScreen';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Plus, Calendar, TrendingUp, Settings } from '../../icons';
import {
  loadEntries, loadCustom,
  insertEntry, updateEntry, deleteEntryById, saveCustom,
} from './api';
import { genId } from '../../lib/utils';
import TodayView from './views/TodayView';
import LogView from './views/LogView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';
import EditEntryModal from './components/EditEntryModal';

const TABS = [
  { id: 'today',    Icon: Plus,        label: '记录' },
  { id: 'log',      Icon: Calendar,    label: '日志' },
  { id: 'stats',    Icon: TrendingUp,  label: '统计' },
  { id: 'settings', Icon: Settings,    label: '设置' },
];

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

  // 注意：addEntry / updateEntryInDB / deleteEntry / addCustomPreset /
  //       removeCustomPreset / exportData / importData
  // 这 7 个函数必须从原 App() 函数里逐字搬过来，仅做：
  //   1. 删除 readOnly 检查的 if 块（改成在调用处用 isOwner 检查）
  //   2. 把 setToast/showToast 改成 useToast 的 showToast
  //   3. 保留乐观更新 + 失败回滚的完整逻辑

  const guard = () => {
    if (!isOwner) { showToast("只读模式，请先登录"); return false; }
    return true;
  };

  // ... 7 个 handler 函数

  if (loading) {
    return (
      <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <LoadingScreen />
      </div>
    );
  }

  if (loadError) {
    return (
      <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <TopBar title="健身房" emoji="🏋️" />
        <ErrorScreen error={loadError} />
      </div>
    );
  }

  return (
    <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <TopBar title="健身房" emoji="🏋️" />
      <div className="paper-texture max-w-md mx-auto relative" style={{ paddingBottom: 100 }}>
        <main className="px-5 pt-4">
          {tab === 'today'    && <TodayView    entries={entries} onAdd={addEntry} custom={custom} onAddCustomPreset={addCustomPreset} />}
          {tab === 'log'      && <LogView      entries={entries} onDelete={deleteEntry} onEdit={setEditingEntry} custom={custom} />}
          {tab === 'stats'    && <StatsView    entries={entries} custom={custom} />}
          {tab === 'settings' && <SettingsView custom={custom} onRemoveCustom={removeCustomPreset} onExport={exportData} onImport={importData} entryCount={entries.length} />}
        </main>
      </div>

      <BottomTabBar tabs={TABS} active={tab} onChange={setTab} />

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
  );
}
```

### 7.6 健身房自查清单（每项必过）

- [ ] 底部 tab 用的是 `<BottomTabBar />` 共享组件（不是房间内自定义的 nav）
- [ ] TodayView 顶部今日摘要卡片显示次数、分钟、卡路里、次数 4 个数字
- [ ] 有氧 mode 下 CardioForm 含 5 个预设 chip + "+ 新项目" + 自定义表单（带 EmojiPicker，48 emoji 调色板）
- [ ] 无氧 mode 下 StrengthForm 含 6 个预设 chip + "+ 新动作" + 自定义表单
- [ ] ExtraFields 完整含 4 个心情按钮 + 5 星难度 + 5 个场地 chip + "+ 新场地" + 笔记折叠区
- [ ] LogView 三个筛选 chip 全在
- [ ] LogItem 移动端能左滑出"编辑/删除"两个按钮，二次点击删除确认
- [ ] LogItem 备注超过 60 字会折叠，能展开收起
- [ ] **StatsView 含全部 11 个区块**（详见 7.4）
- [ ] StatsView 运动项目分解的 3 种排序切换正常
- [ ] SettingsView 数据卡片可导入导出 JSON
- [ ] SettingsView 3 个自定义预设列表（cardio/strength/locations）可单独删除项
- [ ] EditEntryModal 含完整的所有字段编辑能力
- [ ] 所有 input 用了 `.input` 类（极简下划线风格）
- [ ] 文件行数：StatsView.jsx 应在 350+ 行

---

## 八、第 3 章：书房（Study）逐字迁移

源文件：`study/index.html`（约 1700 行）

### 8.1 Step 1：读源文件

完整阅读 `study/index.html`。注意：

- 顶部有大段 PROJECT_PLANS 数据（必须原样搬到 plans.js）
- 含 5 个 Modal（CheckInModal、AddNoteModal、EditNoteModal、EditSubtitleModal、ArchiveModal）+ ModalShell + CloseBtn
- 含 2 个数据可视化组件（Heatmap、TrendChart，都是 SVG 实现）
- HomePage 是项目列表，ProjectPage 是项目详情，互不嵌套但共用同一个 App
- 含 archive 归档/恢复逻辑

### 8.2 Step 2：抽 api.js

11 个函数原样搬：

- `loadProjects` / `updateProject`
- `loadLogs` / `insertLog` / `deleteLog`
- `loadNotes` / `insertNote` / `updateNote` / `deleteNote`
- `loadModuleMeta` / `upsertModuleMeta`

### 8.3 Step 3：抽 plans.js

```js
export const PROJECT_PLANS = {
  llm: [ /* 完整搬运 m1/m2/m3/m4 四个阶段，每个阶段的 items 必须一个不少 */ ],
};

export const TYPE_CONFIG = {
  video: { label: "视频", color: "#b45309", bg: "#fef3c7" },
  code:  { label: "代码", color: "#0f766e", bg: "#ccfbf1" },
  read:  { label: "阅读", color: "#6d28d9", bg: "#ede9fe" },
};
```

PROJECT_PLANS.llm 包含 51 个 item（m1: 17 个、m2: 16 个、m3: 7 个、m4: 11 个），数一下，少一个都不行。

### 8.4 Step 4：StudyPage.jsx 路由结构

```jsx
import { Routes, Route } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import ProjectListView from './views/ProjectListView';
import ProjectDetailView from './views/ProjectDetailView';

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
        <Route path=":projectId" element={
          <>
            <TopBar title="书房" emoji="📚" />
            <ProjectDetailView />
          </>
        } />
      </Routes>
    </div>
  );
}
```

### 8.5 Step 5：拆 view 和 component

| 新文件 | 对应原函数 | 关键功能 |
|---|---|---|
| `views/ProjectListView.jsx` | `HomePage` | 标题区"学习日志" + "进行中"区域 + ProjectCard 列表 + "已归档"折叠区 + 提示卡片 |
| `views/ProjectDetailView.jsx` | `ProjectPage` | 加载 logs/notes/moduleMeta 三种数据 + 处理所有 modal + 渲染 ProjectHeader + 4 个 tab + BottomTabBar |
| `views/PlanView.jsx` | `PlanView` | 渲染各 ModuleCard，含 noteCounts 计算 |
| `views/NotesView.jsx` | `NotesView` | 待解决/已解决统计 + 两组 NoteCard 列表 + 空状态 |
| `views/ExtraView.jsx` | `ExtraView` | 添加按钮 + 按日期分组的额外学习记录 |
| `views/HistoryView.jsx` | `HistoryView` | 摘要卡片 + 90天热力图 + 14天折线图 + 完整历史按日期分组 |
| `components/ProjectCard.jsx` | `ProjectCard` | 项目卡片（含异步加载该项目的进度统计、最近打卡相对时间） |
| `components/ArchivedProjectCard.jsx` | `ArchivedProjectCard` | 已归档卡片，含"查看"和"恢复"按钮 |
| `components/ProjectHeader.jsx` | `ProjectHeader` | 返回项目列表按钮 + 项目标题 + "距离上次学习多少天"右侧大字 + 进度条 + 待解决数 + 紧急程度提示文案（3天/7天）+ 全部完成时的归档按钮 |
| `components/ModuleCard.jsx` | `ModuleCard` | 模块折叠卡片 + emoji 方块 + 标题 + 时间副标题（可点击编辑）+ 完成数/总数 + 进度条 + 展开后的 StudyItem 列表 |
| `components/StudyItem.jsx` | `StudyItem` | 打卡圆 + 类型 badge + "今日已打卡" badge + "N 待解决"badge + 标题 + 描述 + URL 链接 + "+ 加难点"按钮 |
| `components/NoteCard.jsx` | `NoteCard` + `SectionHeader` | 难点卡片，左边框红/绿 + 归属任务 + 内容 + 解决方案绿框 + 编辑/删除/解决按钮 |
| `components/Heatmap.jsx` | `Heatmap` | 90 天打卡热力图，按周分组 SVG 实现，5 档蓝色 |
| `components/TrendChart.jsx` | `TrendChart` | 14 天打卡趋势 SVG 折线图，含填充区域和数据点 |
| `components/modals/ModalShell.jsx` | `ModalShell` + `CloseBtn` | 底部弹起的模态外壳（圆角顶部 + 半透明遮罩 + 拖动条 + 关闭按钮） |
| `components/modals/CheckInModal.jsx` | `CheckInModal` | 选日期 + 备注 + 打卡按钮 |
| `components/modals/AddNoteModal.jsx` | `AddNoteModal` | 添加难点（item 关联）或额外学习（独立日期） |
| `components/modals/EditNoteModal.jsx` | `EditNoteModal` | 编辑难点内容 + 解决方案（额外学习只能编辑内容） |
| `components/modals/EditSubtitleModal.jsx` | `EditSubtitleModal` | 编辑模块时间副标题 |
| `components/modals/ArchiveModal.jsx` | `ArchiveModal` | 归档项目时写总结 |

**注意：原 study 项目的 `BottomNav` 组件 → 删除**，统一用根 `BottomTabBar`。

### 8.6 ProjectDetailView 的 BottomTabBar 用法

```jsx
const tabs = [
  { id: 'plan',    Icon: Layers,    label: '计划' },
  { id: 'notes',   Icon: Lightbulb, label: '难点本', badge: unresolvedCount },
  { id: 'extra',   Icon: Sparkles,  label: '额外' },
  { id: 'history', Icon: Calendar,  label: '记录' },
];
<BottomTabBar tabs={tabs} active={tab} onChange={setTab} />
```

### 8.7 ProjectListView 自查

- [ ] 顶部有"Daydayup"小字（mono 风格）和"学习日志"大标题（保留为页面正文开场，跟 TopBar 不冲突）
- [ ] "进行中"区域有计数 + 卡片列表 + 空状态（🌱 emoji）
- [ ] "已归档"区域可折叠展开（带 chevron 旋转动画）
- [ ] 已归档卡片含项目 emoji、名称、Trophy 图标、归档日期、总结、查看/恢复按钮
- [ ] 底部"想新增计划？告诉 Claude…"虚线提示卡片
- [ ] 因为是列表页，**没有底部 tab 栏**

### 8.8 ProjectDetailView 自查

- [ ] 加载完成前显示 loading
- [ ] ProjectHeader 含返回按钮、项目 emoji + 标题、"距离上次学习多少天" 状态卡（4 种状态：还没开始/今天已学习/上次学习/已停滞）
- [ ] 进度条 + 完成数 + 待解决数提示
- [ ] daysSinceLastLog ≥ 3 时显示黄色提示，≥ 7 时显示红色严重提示
- [ ] 全部完成时显示金色"归档计划"按钮
- [ ] 4 个 tab 切换正常（用 BottomTabBar）
- [ ] BottomTabBar 难点本 tab 上显示未解决数量 badge
- [ ] 5 个 modal 都能正常打开/关闭

### 8.9 HistoryView 必须包含

- [ ] 摘要卡片（打卡总次数、活跃天数）
- [ ] **Heatmap 组件**：90 天热力图，按周分组（每列 7 天，从周日到周六），5 档颜色（line/bfdbfe/60a5fa/2563eb/1e40af），今天有 accent 描边
- [ ] **TrendChart 组件**：14 天打卡趋势 SVG 折线图，含 trendArea 渐变填充、3 条横向虚线网格、数据点（count > 0 时显示）
- [ ] 完整打卡历史按日期分组，每条含类型 badge、任务标题、模块归属、备注（如有）、删除按钮

---

## 九、第 4 章：卧室（Bedroom）逐字迁移

源文件：`health/index.html`（约 1100 行）

### 9.1 Step 1：读源文件

完整阅读 `health/index.html`。注意：

- 顶部有 PHASES 数据（35 天验证期、起始 2026-05-06）
- DAILY_ITEMS 是 10 个打卡项的元数据
- 含 `getCalorieStatus`、`getExercisePlan`、`getCalorieTarget`、`isSaturday`、`phaseDates` 多个业务函数
- HomePage 是阶段列表、PhasePage 是阶段详情，结构和 study 类似但更轻量
- 原项目的 input 大量使用实心边框样式，迁移时**统一改成 `.input` 类**

### 9.2 Step 2：抽 api.js

3 个函数原样搬：`loadAllLogs`、`upsertLog`、`deleteLog`。

### 9.3 Step 3：抽 plans.js

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
    goal: "...",  // 完整搬运
    targets: "...",
    weeklyCalories: "...",
  },
];

export const DAILY_ITEMS = [
  /* 10 项完整搬运 */
];

export function getCalorieStatus(actual, target) { /* 完整搬运 */ }
export function getExercisePlan(dateStr) { /* 完整搬运，含周日到周六 7 个 plan */ }
export function getCalorieTarget(dateStr) { /* 周六 1450，其他 1300 */ }
export function isSaturday(dateStr) { /* */ }
export function phaseDates(phase) { /* 生成阶段内所有日期数组 */ }
```

### 9.4 Step 4：BedroomPage.jsx 路由结构

```jsx
import { Routes, Route } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import HomeView from './views/HomeView';
import PhaseView from './views/PhaseView';

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

### 9.5 Step 5：拆 view 和 component

| 新文件 | 对应原函数 | 关键功能 |
|---|---|---|
| `views/HomeView.jsx` | `HomePage` | 阶段列表（每个 PhaseCard 含 emoji/标题/副标题/目标/进度条/起止日期/打卡天数/完成时的奖杯）+ 底部"常用跟练视频"虚线占位卡片 |
| `views/PhaseView.jsx` | `PhasePage` | 加载 logs + 阶段头（返回按钮 + emoji + 标题）+ 当前 tab 渲染 + BottomTabBar |
| `views/OverviewTab.jsx` | `OverviewTab` | **目标卡片 + 热量安排卡片 + 颜色图例卡片 + 5 周日历（每周一卡，含日期格子和颜色规则）+ 每周运动建议卡片** |
| `views/CheckinTab.jsx` | `CheckinTab` | **日期前后导航 + Day N/35 显示 + 回到今天 + 当日运动建议卡片 + 10 个 DailyItemCard + 备注框 + 保存按钮** |
| `views/StatsTab.jsx` | `StatsTab` | **体重变化卡片（含 mini 折线图）+ 日均摄入/运动消耗 + 总运动时长/打卡率 + 吃药记录 + 身体信号** |
| `components/DailyItemCard.jsx` | `DailyItemCard` | 单个打卡项卡片，根据 inputType 渲染不同输入：time/number/check/select/slider/exercise |
| `components/WeightChart.jsx` | `WeightChart` | 体重 mini 折线图 SVG，含 wg 渐变填充、数据点 |

### 9.6 PhaseView 的 BottomTabBar 用法

```jsx
const tabs = [
  { id: 'overview', Icon: ClipboardList, label: '计划总览' },
  { id: 'checkin',  Icon: Calendar,      label: '每日打卡' },
  { id: 'stats',    Icon: BarChart3,     label: '统计' },
];
<BottomTabBar tabs={tabs} active={tab} onChange={setTab} />
```

### 9.7 OverviewTab 必须包含

- [ ] 目标卡片：phase.targets 字符串
- [ ] 热量安排卡片：phase.weeklyCalories + 警示行"⚠️ 饮食严格控制"
- [ ] 颜色图例卡片：4 个色块（绿正常 / 红超标 / 黄过低 / 灰未打卡）
- [ ] 5 周日历卡片：每周一个 card，每天一个 40×40 圆角格子，按 calStatus 上色
- [ ] 每周底部显示超标 N 天 / 过低 N 天提示（如有）
- [ ] 每周运动建议卡片：周一到周日 7 行

### 9.8 CheckinTab 必须包含

- [ ] 上一天/下一天导航按钮（边界自动 disabled）
- [ ] 中间显示日期 + 周几 + 已打卡圆点 + Day N/35
- [ ] "回到今天"按钮（不在今天时显示）
- [ ] 当日运动建议绿框卡片（含 plan.type/plan.desc/热量目标）
- [ ] 周六会显示 🎉 + "（计划内好吃日）"
- [ ] 10 个 DailyItemCard 严格按 DAILY_ITEMS 顺序渲染
- [ ] 备注卡片（用 `.input` textarea）
- [ ] 底部保存按钮（dirty 时高亮，否则灰色"已保存 ✓" 或 "暂无记录"）

### 9.9 DailyItemCard 必须支持 6 种输入类型

- [ ] time：原生 time picker，用 `.input` 类
- [ ] number：number input + 单位 + 热量字段的颜色实时反馈（红/黄/绿）+ 状态文字
- [ ] check：单按钮切换（已服用 ✓ / 未服用）
- [ ] select：3 个选项按钮（正常/费力/无 等）
- [ ] slider：1-10 滑动条 + 当前值大字显示（颜色按值变化）
- [ ] exercise：建议提示 + 类型 input + 时长 input + 消耗 input + 心率 input

### 9.10 StatsTab 必须包含

- [ ] 已记录天数小字
- [ ] 体重变化卡片：起始/变化(带颜色)/最新 + 7日均值高亮 + WeightChart mini 折线图
- [ ] 日均摄入 + 日均运动消耗（2 列）
- [ ] 总运动时长 + 打卡率（2 列）
- [ ] 吃药记录卡片：维生素D / 铁剂 比例
- [ ] 身体信号卡片：平均饥饿 / 平均疲劳 + 排便分布（正常/费力/无）
- [ ] 空状态：没记录时显示 📊 emoji 引导

---

## 十、第 5 章：路由总配置

`src/App.jsx`：

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

## 十一、第 6 章：大厅卡片预览

### 11.1 `hooks/useGymPreview.js`

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export function useGymPreview() {
  const [preview, setPreview] = useState(undefined);
  useEffect(() => {
    supabase.from("workout_entries").select("id, data")
      .order("id", { ascending: false }).limit(1)
      .then(({ data, error }) => {
        if (error || !data?.length) { setPreview(null); return; }
        const e = data[0].data;
        const detail = e.type === 'cardio'
          ? `${e.name} ${e.duration}min`
          : `${e.name} ${e.sets}×${e.reps}`;
        setPreview(`上次训练 · ${formatDate(e.date)} ${detail}`);
      });
  }, []);
  return preview;
}
```

### 11.2 `hooks/useStudyPreview.js`

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { todayStr, daysBetween } from '../lib/utils';

export function useStudyPreview() {
  const [preview, setPreview] = useState(undefined);
  useEffect(() => {
    supabase.from("study_logs").select("date")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data?.length) { setPreview("还没开始记录"); return; }
        const today = todayStr();
        const todayCount = data.filter(l => l.date === today).length;
        if (todayCount > 0) { setPreview(`今日已打卡 · ${todayCount} 项`); return; }
        const days = daysBetween(data[0].date, today);
        if (days === 1) setPreview("上次打卡 · 昨天");
        else if (days < 7) setPreview(`上次打卡 · ${days}天前`);
        else setPreview(`已停滞 ${days} 天`);
      });
  }, []);
  return preview;
}
```

### 11.3 `hooks/useBedroomPreview.js`

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { todayStr, daysBetween } from '../lib/utils';

export function useBedroomPreview() {
  const [preview, setPreview] = useState(undefined);
  useEffect(() => {
    const today = todayStr();
    supabase.from("health_logs").select("date")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data?.length) { setPreview("还没开始记录"); return; }
        if (data.some(l => l.date === today)) { setPreview("今日已记录 ✓"); return; }
        const days = daysBetween(data[0].date, today);
        if (days === 1) setPreview("昨天有记录");
        else setPreview(`已 ${days} 天未记录`);
      });
  }, []);
  return preview;
}
```

### 11.4 大厅 HallPage 改造

在大厅顶部调用 3 个 hook，结果传入 ROOMS：

```jsx
const gymPreview = useGymPreview();
const studyPreview = useStudyPreview();
const bedroomPreview = useBedroomPreview();

const ROOMS = [
  { id: 'gym',     name: '健身房', subtitle: 'Workout',  emoji: '🏋️',
    color: '#d9603b', colorSoft: '#f2c9b5',
    description: '运动记录与训练计划', path: '/gym',     preview: gymPreview },
  { id: 'study',   name: '书房',   subtitle: 'Study',    emoji: '📚',
    color: '#2563eb', colorSoft: '#dbeafe',
    description: '学习打卡与难点笔记', path: '/study',   preview: studyPreview },
  { id: 'bedroom', name: '卧室',   subtitle: 'Bedroom',  emoji: '🛏️',
    color: '#16a34a', colorSoft: '#dcfce7',
    description: '健康数据与日常追踪', path: '/bedroom', preview: bedroomPreview },
];
```

RoomCard 渲染 preview 时三态：`undefined`（骨架）/ `null` 或 string（文字）。

---

## 十二、第 7 章：完整性自检流程（必走）

迁移完成后，对每个房间执行下面的双重校验：

### 12.1 行数粗校验

| 文件 | 期望最低行数 |
|---|---|
| `pages/gym/views/StatsView.jsx` | 350 |
| `pages/gym/views/SettingsView.jsx` | 100 |
| `pages/gym/components/LogItem.jsx` | 200 |
| `pages/gym/components/ExtraFields.jsx` | 200 |
| `pages/gym/components/EditEntryModal.jsx` | 130 |
| `pages/study/views/ProjectDetailView.jsx` | 250 |
| `pages/study/views/HistoryView.jsx` | 150 |
| `pages/study/components/Heatmap.jsx` | 60 |
| `pages/study/components/TrendChart.jsx` | 70 |
| `pages/study/components/ModuleCard.jsx` | 110 |
| `pages/study/components/ProjectHeader.jsx` | 100 |
| `pages/bedroom/views/OverviewTab.jsx` | 170 |
| `pages/bedroom/views/CheckinTab.jsx` | 150 |
| `pages/bedroom/views/StatsTab.jsx` | 180 |
| `pages/bedroom/components/DailyItemCard.jsx` | 130 |

如果你的实现明显低于上述行数，**几乎可以确定是漏了功能**，回去补。

### 12.2 UI 统一性检查

逐项打勾，缺一不可：

- [ ] 三个房间的底部 tab 栏全部用 `<BottomTabBar />` 共享组件，没有任何房间自己实现 nav
- [ ] 三个房间的底部 tab 高度看起来完全一致（量一下 tab-btn 高度都是 56px）
- [ ] 三个房间的 tab label 字号都是 11px
- [ ] 三个房间的 tab 图标都是 size={20}
- [ ] 三个房间的 active tab 颜色都是 var(--accent)（橙/蓝/绿，跟随房间）
- [ ] 三个房间所有的 input/textarea 都用了 `.input` 类（极简下划线）
- [ ] 三个房间的 .card 圆角都是 18px
- [ ] 三个房间的按钮按下都是 scale(0.98)，没有 translateY
- [ ] 三个房间的 toast 位置和样式完全一致

### 12.3 功能清单核对

打开新项目，逐个房间点过去，对照下面 53 项验收：

#### 健身房（17 项）

1. ☐ 底部有 4 个 tab（记录/日志/统计/设置），用 BottomTabBar
2. ☐ 记录-有氧：5 个预设 + 自定义新项目（含 EmojiPicker 网格）+ 时长/卡路里/日期 + ExtraFields
3. ☐ 记录-无氧：6 个预设 + 自定义新动作 + 组数/次数/日期 + ExtraFields
4. ☐ ExtraFields 含心情 4 选 + 5 星难度 + 5 个场地预设 + 自定义新场地（带 EmojiPicker）+ 笔记折叠区
5. ☐ 日志：3 个筛选 chip
6. ☐ 日志：按日期分组，每天一个 card
7. ☐ 日志：移动端左滑出现编辑/删除按钮
8. ☐ 日志：备注 60+ 字时折叠展开
9. ☐ 日志：编辑模态框打开后所有字段都能改
10. ☐ 统计：4 个 hero 卡片
11. ☐ 统计：当前连续 + 最长记录 2 卡片
12. ☐ 统计：有氧无氧比例条 + 30 天热力图 + 颜色图例
13. ☐ 统计：心情分布 + 平均难度 2 卡片
14. ☐ 统计：场地分布胶囊列表
15. ☐ 统计：运动项目分解（3 种排序切换）
16. ☐ 设置：导入/导出 JSON 按钮
17. ☐ 设置：3 个自定义预设列表（含单独删除）

#### 书房（22 项）

18. ☐ 项目列表：进行中卡片（进度条 + 完成数 + 最近打卡相对时间）
19. ☐ 项目列表：已归档区可折叠展开（chevron 旋转）
20. ☐ 已归档卡片：emoji + 名称 + Trophy + 归档日期 + 总结 + 查看/恢复按钮
21. ☐ 项目详情：底部 4 个 tab（计划/难点本/额外/记录），用 BottomTabBar
22. ☐ 项目详情：难点本 tab 上有未解决数量 badge
23. ☐ ProjectHeader："距离上次学习" 4 种状态显示正确
24. ☐ ProjectHeader：3 天紧急黄提示，7 天严重红提示
25. ☐ ProjectHeader：全部完成时显示金色"归档计划"按钮
26. ☐ 计划 tab：模块卡片可折叠（chevron 旋转 + maxHeight 过渡）
27. ☐ 计划 tab：模块时间副标题点击可编辑（EditSubtitleModal）
28. ☐ 计划 tab：StudyItem 打卡圆能切换状态
29. ☐ 计划 tab：StudyItem 含类型 badge / "今日已打卡"badge / "N 待解决"badge
30. ☐ 计划 tab：StudyItem 有 URL 时显示外链 + "+ 加难点"按钮
31. ☐ 难点本 tab：待解决/已解决统计卡 + 两组 NoteCard 列表
32. ☐ 难点本 tab：NoteCard 编辑/删除/标记解决正常
33. ☐ 难点本 tab：解决方案显示绿色框
34. ☐ 额外 tab：添加按钮（蓝色实心）
35. ☐ 额外 tab：按日期分组的额外学习记录
36. ☐ 记录 tab：摘要卡片（打卡总次数 + 活跃天数）
37. ☐ 记录 tab：**90 天热力图**（按周分组 + 5 档蓝色 + 今天描边 + 图例）
38. ☐ 记录 tab：**14 天打卡趋势 SVG 折线图**（含填充区域 + 数据点 + 网格）
39. ☐ 记录 tab：完整打卡历史按日期分组，每条可删除

#### 卧室（14 项）

40. ☐ 阶段列表：阶段卡片（emoji + 标题 + 目标 + 起止日期 + 进度条 + 打卡天数）
41. ☐ 阶段详情：底部 3 个 tab（计划总览/每日打卡/统计），用 BottomTabBar
42. ☐ 计划总览：目标卡片 + 热量安排卡片
43. ☐ 计划总览：颜色图例（绿/红/黄/灰）
44. ☐ 计划总览：5 周日历（每周一卡，每天 40×40 格子，按 calStatus 上色）
45. ☐ 计划总览：每周超标/过低天数提示
46. ☐ 计划总览：每周运动建议（周一到周日）
47. ☐ 每日打卡：日期前后导航 + 回到今天
48. ☐ 每日打卡：当日运动建议卡片（绿框）+ 周六 🎉
49. ☐ 每日打卡：10 个项目按顺序渲染（time/number/check/select/slider/exercise 6 种类型）
50. ☐ 每日打卡：热量字段红/黄/绿实时反馈
51. ☐ 每日打卡：备注框 + 保存按钮（dirty 状态正确）
52. ☐ 统计：体重变化卡片 + WeightChart mini 折线图
53. ☐ 统计：日均摄入/运动消耗、总时长/打卡率、吃药记录、身体信号

如果以上 53 项有任何一项打不了勾，回去补，**不要凑合**。

---

## 十三、不要做的事

- ❌ 不要"看起来差不多就先这样"——每个组件、每个统计区块都必须完整
- ❌ 不要简化任何 useMemo 计算逻辑，stats 算法一字不改搬
- ❌ 不要丢掉 SVG 实现的图表（Heatmap、TrendChart、WeightChart）
- ❌ 不要修改 PROJECT_PLANS、PHASES、DAILY_ITEMS、CARDIO_PRESETS 等数据常量
- ❌ 不要修改 Supabase 表结构和字段
- ❌ 不要保留任何手写的 LucideIcon 兼容代码
- ❌ 不要保留任何 LoginScreen 内联组件
- ❌ 不要让任何房间自己实现底部 nav，必须用 BottomTabBar
- ❌ 不要在某个房间内重新定义 .tab-btn / .card / .input 等通用类
- ❌ 不要用 translateY 做按钮按下动画
- ❌ 不要用 health 项目原本的实心 input 样式，一律改成 .input 极简下划线
- ❌ 不要在颜色变量上自由发挥（按第五章映射规则严格替换）
- ❌ 不要修改 `workout/`、`study/`、`health/` 原目录（作为参考备份）
- ❌ 看到原代码"奇怪但不知道为啥"时不要擅自删除/简化，先问

---

## 十四、提交时要发我

完成后请告诉我：

1. **文件创建/修改清单**（按章节列）
2. **行数粗校验报告**：列出第 12.1 节里 15 个关键文件的实际行数对比
3. **UI 统一性检查（12.2 节）的勾选结果**
4. **53 项功能清单（12.3 节）的勾选结果**，每项 ☑ 或 ☐ 加一行说明
5. **截图**至少 11 张：
   - 大厅（含 3 张卡片预览数据）
   - 健身房：记录、日志、统计、设置 共 4 张
   - 书房：项目列表、项目详情(计划)、项目详情(难点本)、项目详情(记录)，共 4 张
   - 卧室：阶段列表、阶段详情(总览)、阶段详情(打卡)、阶段详情(统计) 共 4 张
6. **专门的 UI 统一对比截图**：把三个房间的底部 tab 栏并排截一张图，证明它们高度、字号、布局完全一致（只有主题色不同）
7. 任何**主动偏离本文档要求**的地方，明确写出来 + 原因

如果迁移过程中发现原 HTML 里有 bug 或自相矛盾的代码，**先停下来问我**，不要自己改业务逻辑。

---

## 十五、最后强调

这次任务**不接受"骨架先搭好，细节回头补"的做法**。每一个组件、每一个统计图表、每一个交互细节，**必须在本次提交里就完整**。提交前请你自己用上面 53 项清单 + UI 统一性检查严格自查一遍。

如果发现某个区块没办法完整搬运（比如 SVG 不会写、useMemo 太复杂看不懂），**停下来问我**——我会给你具体的指导，而不是接受一个简化版。
