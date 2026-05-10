# wxh的电子生存数据 — Vite+React 重构 P0 阶段执行文档

> 这份文档是发给执行端（Claude Desktop / Claude Code）的完整任务说明。
> 范围只覆盖 P0 阶段（搭骨架），不包含三个房间的业务逻辑迁移。

---

## 一、背景说明

我目前有一个个人数据管理仓库 `MyData`，里面有三个独立的功能模块，每个都是单文件 HTML（React 18 + Babel standalone + Tailwind CDN + Supabase）：

- `workout/index.html` — 运动日志（健身房模块）
- `study/index.html` — 学习日志（书房模块）
- `health/index.html` — 健康日志（客厅模块）

**请先用 view 工具完整阅读这三个文件以及它们对应的 README**，理解每个模块的：

- 数据库表结构和 CRUD 逻辑
- 业务逻辑（打卡、记录、统计等）
- UI 组件、样式、主题色
- 登录鉴权方式（Supabase Auth + 访客只读模式）

这三个项目使用同一个 Supabase 实例，但每个用各自独立的表，**数据库无需迁移**。

---

## 二、本次重构的目标

把三个独立 HTML 合并到一个 Vite + React 项目里，引入「家」的导航隐喻：

- **登录页 = 家的大门**
- **大厅 = 房子的中枢**（呈现空间，列出所有房间）
- **三个原模块 = 三个房间**（健身房 / 书房 / 客厅），各自保留独立的主题色与设计语言

大厅是新增的页面，三个房间是从现有 HTML 迁移过来的。后续还会加更多房间，所以架构必须可扩展。

---

## 三、本次任务范围（P0 阶段）

**本次只做骨架，不迁移业务逻辑。** 三个房间页面在这一阶段只是空壳，里面放一个占位卡片即可。后续 P1/P2/P3 阶段再分别迁移业务逻辑。

P0 完成后必须能做到：

1. 能登录或以访客身份进入
2. 进入大厅看到三张房间卡片，每张卡片有自己的主题色
3. 点击卡片能进入对应房间，房间内的整体配色（背景、卡片、按钮）自动切换为该房间的主题色
4. 房间内点「返回大厅」回到大厅，配色变回中性
5. `npm run build` 能通过，可以部署到 Cloudflare Pages

---

## 四、技术栈与版本（必须严格遵守）

- **构建工具**：Vite（最新稳定版）
- **框架**：React 18
- **路由**：react-router-dom v6
- **样式**：Tailwind CSS v3（不要用 v4），通过 PostCSS 集成
- **数据库 SDK**：`@supabase/supabase-js` v2
- **图标**：`lucide-react@0.292.0`（**版本必须锁定 0.292.0**，与现有项目保持一致；不要用 latest）

---

## 五、Supabase 配置

```
SUPABASE_URL  = "https://ettxqjdtrbjqoctwmprw.supabase.co"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dHhxamR0cmJqcW9jdHdtcHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTI5NzYsImV4cCI6MjA5MjE2ODk3Nn0.o5JdtIHNIRu2Bthbyckh6PqmsTF09u31wPr12xhBaYI"
```

这两个值放到 `.env` 文件里（`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`），并在 `.env.example` 里给出占位示例。`.env` 已在 `.gitignore` 里，不会被提交。

---

## 六、项目目录结构（请严格按此创建）

```
wxh-life/                        ← 新项目根目录
├── public/
│   └── icon.png                 ← 占位 favicon，可以随便用一张
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← 路由总入口
│   │
│   ├── lib/
│   │   ├── supabase.js          ← Supabase client 单例
│   │   └── utils.js             ← genId / todayStr / formatDate / relativeDate / daysBetween
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   │
│   ├── styles/
│   │   ├── tokens.css           ← 三层 CSS 变量令牌
│   │   ├── components.css       ← 通用组件类
│   │   └── global.css           ← reset + 字体导入 + 动画
│   │
│   ├── components/
│   │   ├── AuthGuard.jsx
│   │   ├── RoomCard.jsx
│   │   ├── TopBar.jsx
│   │   ├── Toast.jsx
│   │   ├── ToastContainer.jsx
│   │   ├── LoadingScreen.jsx
│   │   └── ErrorScreen.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── HallPage.jsx
│   │   ├── gym/
│   │   │   └── GymPage.jsx        ← P0 阶段只放占位
│   │   ├── study/
│   │   │   └── StudyPage.jsx      ← P0 阶段只放占位
│   │   └── living/
│   │       └── LivingRoomPage.jsx ← P0 阶段只放占位
│   │
│   └── icons/
│       └── index.js             ← 从 lucide-react re-export 用到的图标
│
├── .env
├── .env.example
├── .gitignore
├── _redirects                   ← Cloudflare Pages SPA 路由重写
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md                    ← 新项目的 README
```

---

## 七、设计令牌系统（核心，请严格实现）

这是整个项目 UI 统一性的关键。原三个 HTML 各自硬编码了颜色和样式，重构后必须通过 CSS 变量统一管理，让同一份组件代码在不同房间自动呈现该房间的主题色。

### 7.1 `src/styles/tokens.css` 完整内容

```css
/* ============================================
   第一层：基础令牌 — 全局共享，跨房间不变
   ============================================ */
:root {
  /* 字体族 */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Manrope', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  /* 动画 */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 0.15s;
  --duration-base: 0.25s;

  /* ============================================
     第二层：语义令牌 — 大厅默认中性主题
     ============================================ */
  --bg: #fafaf7;
  --bg-card: #ffffff;
  --ink: #1a1a1a;
  --ink-soft: #555555;
  --ink-faint: #999999;
  --accent: #1a1a1a;
  --accent-soft: #f0efe9;
  --line: #e8e6e0;
}

/* ============================================
   各房间主题：通过 data-room 属性切换
   ============================================ */
[data-room="gym"] {
  --bg: #f4efe6;
  --bg-card: #fbf7ef;
  --ink: #2a241c;
  --ink-soft: #6b6055;
  --ink-faint: #a59a8c;
  --accent: #d9603b;
  --accent-soft: #f2c9b5;
  --line: #e0d6c5;
}

[data-room="study"] {
  --bg: #f0f4ff;
  --bg-card: #f8faff;
  --ink: #0f1c3f;
  --ink-soft: #3d5080;
  --ink-faint: #8a9cc2;
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --line: #d5e0f7;
}

[data-room="living"] {
  --bg: #f0faf0;
  --bg-card: #f8fcf8;
  --ink: #0f2b1a;
  --ink-soft: #3d6b50;
  --ink-faint: #8aac96;
  --accent: #16a34a;
  --accent-soft: #dcfce7;
  --line: #c6e4cf;
}
```

### 7.2 `src/styles/components.css`

把现有三个 HTML 中各自重复定义的 .card / .btn-primary / .btn-ghost / .input / .chip / .tab-btn / .toast / .animate-in 等通用样式抽取出来，**全部改用 var(--xxx) 变量**，不要硬编码颜色。

关键类（请实现）：

- `.display` — Fraunces，letter-spacing -0.02em
- `.mono` — JetBrains Mono
- `.card` — bg-card 背景，line 边框，radius-xl 圆角
- `.input` — 透明背景，下边框，focus 时变 accent
- `.btn-primary` — accent 背景，白字，radius-lg，hover 微抬
- `.btn-ghost` — 透明背景，line 边框，hover 时边框变 ink
- `.chip` — 圆角 999px，padding 8px 14px，active 状态背景变 ink
- `.tab-btn` / `.tab-dot` — 底部 tab 按钮的样式
- `.toast` — fixed 底部居中，ink 背景白字，圆角胶囊
- `.animate-in` — 0.25s 上滑淡入
- `.paper-texture` — 两个径向渐变叠加（参考原 workout 项目）

注意要点：

- 所有颜色使用 `var(--bg)` / `var(--accent)` 等变量
- 不要在 .css 文件里写任何 #hex 颜色值（除了注释里的说明）
- 字体使用 `var(--font-display)` 等变量

### 7.3 `src/styles/global.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens.css';
@import './components.css';

html, body { margin: 0; padding: 0; }
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  transition: background var(--duration-base) var(--ease), color var(--duration-base) var(--ease);
}
```

---

## 八、各文件具体实现要求

### 8.1 `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon);
```

### 8.2 `src/lib/utils.js`

实现以下工具函数（参考三个原 HTML 中已有的实现，统一签名）：

- `genId()` — `Date.now() * 1000 + Math.floor(Math.random() * 1000)`
- `todayStr()` — 返回 `YYYY-MM-DD`
- `formatDate(str)` — `2026-05-07` → `5月7日`
- `relativeDate(isoStr)` — 返回「今天」「昨天」「3天前」等
- `daysBetween(a, b)` — 返回 b - a 的天数（整数）
- `getWeekday(str)` — 返回 `周一` 等

### 8.3 `src/hooks/useAuth.js`

提供 React Context：`AuthProvider` 包裹 App，`useAuth()` Hook 返回：

```js
{
  session,        // Supabase session 对象，未登录为 null
  user,           // session?.user
  isOwner,        // !!session
  isGuest,        // localStorage.getItem('wxh_guest_mode') === 'true'
  loading,        // 初次加载时 true
  login(email, password),    // async, 返回 { error?: string }
  logout(),                  // async
  enterAsGuest(),            // 设置 localStorage 标志，触发状态更新
  exitGuest(),               // 清除 localStorage 标志
}
```

内部要监听 `db.auth.onAuthStateChange` 实时更新 session，组件卸载时取消订阅。

重要：访客模式（isGuest）和登录模式（isOwner）是互斥的；登录时自动清除访客标志。

### 8.4 `src/hooks/useToast.js` + `src/components/ToastContainer.jsx`

实现一个轻量全局 toast 系统：

- `<ToastProvider>` 包裹 App
- `useToast()` 返回 `{ showToast(msg, duration = 1800) }`
- `<ToastContainer />` 挂在根布局，监听 toast 状态，渲染当前 toast
- 同时只显示一条，新调用会替换旧的
- 样式用 `.toast` 类（已在 components.css 定义）

### 8.5 `src/components/AuthGuard.jsx`

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function AuthGuard({ children }) {
  const { isOwner, isGuest, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isOwner && !isGuest) return <Navigate to="/" replace />;
  return children;
}
```

### 8.6 `src/components/LoadingScreen.jsx` 和 `ErrorScreen.jsx`

通用加载/错误屏，参考原三个项目的 LoadingScreen 和 ErrorScreen 实现，使用语义令牌。

### 8.7 `src/components/RoomCard.jsx`

Props: `{ id, name, subtitle, emoji, color, colorSoft, description, path, preview }`

视觉规格：

- 整张卡片是 `<Link to={path}>`，display: block
- 圆角 20px，padding 24px，最小高度 180px
- 背景：`linear-gradient(135deg, ${colorSoft}66, ${colorSoft}cc)`（用 alpha 透明度做渐变）
- 内部布局（垂直）：
  - 顶行：左侧 56×56 圆角 16px 方块（背景纯 `${color}`，居中白色 emoji 28px），右侧无内容
  - 中间区：房间名（Fraunces 22px 700 ink），下方 mono uppercase 11px ink-faint 显示 subtitle
  - 描述（13px ink-soft，1.5 行高）
  - 底部：preview 区（mono 11px ink-soft，预留空间，preview 为空时显示骨架）
  - 右下角：小 chevron-right 箭头（lucide-react），ink-faint
- hover：transform translateY(-4px)，box-shadow 加深，过渡 0.2s ease
- active：transform translateY(-2px)

P0 阶段 preview 字段固定传 `undefined`，显示骨架占位即可（一条灰色横线）。后续阶段会根据各房间数据动态填充。

### 8.8 `src/components/TopBar.jsx`

Props: `{ title, emoji, onBack, rightSlot }`

渲染：

- sticky top-0，z-10，background var(--bg)，下边框 1px var(--line)
- padding 12px 20px
- 左侧：圆角胶囊「← 大厅」按钮，btn-ghost 风格，小号
- 中间：emoji + Fraunces 18px 700 title
- 右侧：rightSlot 插槽（可空）
- 移动端单行布局，桌面端最大宽 480px 居中

onBack 默认行为：`navigate('/hall')`

### 8.9 `src/pages/LoginPage.jsx`

这是「家的大门」，融合三个原项目登录页的精华，做一个统一的版本。

**完整视觉规格：**

- 全屏背景：`linear-gradient(145deg, #f4efe6 0%, #f0f4ff 50%, #f0faf0 100%)`（三个房间色融合）
- 两个装饰大圆：
  - 右上：`top: -120px; right: -80px; width: 340px; height: 340px;`，背景 `radial-gradient(circle, rgba(217,96,59,0.10) 0%, transparent 70%)`
  - 左下：`bottom: -100px; left: -60px; width: 280px; height: 280px;`，背景 `radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)`
- 中间内容居中，最大宽 360px，padding 0 24px

**Logo 区**（margin-bottom 40px，居中）：

- 72×72 圆角 22px 方块，背景 `linear-gradient(135deg, #2a2a2a, #1a1a1a)`，box-shadow `0 8px 32px rgba(0,0,0,0.15)`，居中放 emoji 🏠（34px）
- 标题 Fraunces 26px 800：「wxh的电子生存数据」
- 副标题 mono uppercase tracking 0.12em 11px：「EST. 2026 · WXH」

**登录卡片**（玻璃质感）：

- background: rgba(255,255,255,0.85)
- backdrop-filter: blur(12px)
- border: 1px solid rgba(232,230,224,0.8)
- border-radius: 24px
- padding: 32px 28px
- box-shadow: `0 4px 40px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset`

卡片内：

- 邮箱输入：mono uppercase 小标签 + input
- 密码输入：同上
- 错误提示框（如果有）：红色背景 #fee2e2，红字 #b91c1c
- 主按钮「进入」：黑色渐变 `linear-gradient(135deg, #2a2a2a, #1a1a1a)`，白字
- 次按钮「无账号，仅查看数据」：透明背景，line 边框，accent 文字

**底部提示**（margin-top 28px，居中）：

- 12px ink-faint：「这是 wxh 的私人空间」+ 换行 + 「如需访问权限请联系 wxh」（联系部分用强调色）

**行为：**

- 登录成功后 `navigate('/hall', { replace: true })`
- 点访客按钮调用 `enterAsGuest()` 然后 `navigate('/hall', { replace: true })`
- 已登录或访客模式下访问 `/`，自动跳到 `/hall`
- Enter 键触发登录

### 8.10 `src/pages/HallPage.jsx`

这是新增的页面，按以下规格实现：

**顶部 Header**（padding 40px 20px 24px，最大宽 1200px 居中）：

- 左侧：mono uppercase tracking-widest 11px ink-faint「EST. 2026 · WXH」
- 左侧标题：Fraunces 36px 800 ink「电子生存数据」（移动端 28px）
- 右侧：当前日期，上方 mono 12px ink-faint 显示星期，下方 Fraunces 32px 600 accent 显示日号
- 右上角：圆形小按钮组，包含一个「退出」按钮（lucide LogOut 图标），点击调用 logout 或 exitGuest 后跳回 `/`

**房间区**（padding 0 20px，最大宽 1200px 居中）：

- 桌面：grid grid-cols-3 gap-5
- 平板：grid grid-cols-2 gap-4
- 移动：grid grid-cols-1 gap-4

**房间配置**（写在 HallPage 内部的常量数组）：

```js
const ROOMS = [
  {
    id: 'gym',
    name: '健身房',
    subtitle: 'Workout',
    emoji: '🏋️',
    color: '#d9603b',
    colorSoft: '#f2c9b5',
    description: '运动记录与训练计划',
    path: '/gym',
  },
  {
    id: 'study',
    name: '书房',
    subtitle: 'Study',
    emoji: '📚',
    color: '#2563eb',
    colorSoft: '#dbeafe',
    description: '学习打卡与难点笔记',
    path: '/study',
  },
  {
    id: 'living',
    name: '客厅',
    subtitle: 'Living',
    emoji: '🌿',
    color: '#16a34a',
    colorSoft: '#dcfce7',
    description: '健康数据与日常追踪',
    path: '/living',
  },
];
```

**底部**（margin-top 64px，padding-bottom 40px，居中）：

- mono 11px ink-faint：`v0.1`（极简版本号，不要鸡汤口号）

**重要：HallPage 不要加 `data-room` 属性**，使用根 `:root` 的中性主题。

访客模式下，在标题下方加一个小标签（mono 10px，灰色背景圆角胶囊）：「访客模式 · 只读」。

### 8.11 三个房间占位页：`pages/gym/GymPage.jsx`、`pages/study/StudyPage.jsx`、`pages/living/LivingRoomPage.jsx`

P0 阶段每个文件结构相同（除了 data-room 值和文案）：

```jsx
import TopBar from '../../components/TopBar';

export default function GymPage() {
  return (
    <div data-room="gym" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <TopBar title="健身房" emoji="🏋️" />
      <div className="max-w-md mx-auto p-5">
        <div className="card animate-in" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <div className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
            健身房
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Workout · 迁移中
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 16, lineHeight: 1.6 }}>
            这个房间的内容会在 P1 阶段从 workout/index.html 迁移过来
          </div>
        </div>
      </div>
    </div>
  );
}
```

三个文件分别用 `data-room="gym"` / `study` / `living`，emoji 用 🏋️ / 📚 / 🌿，文案对应改写。

### 8.12 `src/App.jsx`

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
import LivingRoomPage from './pages/living/LivingRoomPage';

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
            <Route path="/living/*" element={<AuthGuard><LivingRoomPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
```

### 8.13 `src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 8.14 `index.html`（项目根目录）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="icon" type="image/png" href="/icon.png" />
  <title>wxh的电子生存数据</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 8.15 配置文件

**`vite.config.js`**：

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

**`tailwind.config.js`**：

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

**`postcss.config.js`**：

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

**`_redirects`**（项目根目录，Cloudflare Pages 用）：

```
/*    /index.html   200
```

**`.gitignore`**（确保以下条目存在）：

```
node_modules/
dist/
.env
.env.*
!.env.example
.DS_Store
```

**`.env.example`**：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**`package.json`** scripts：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 8.16 `README.md`

写一个简短的项目说明，包含：

- 项目简介
- 房间体系说明（大厅 + 三个房间）
- 启动方式（`npm install`、`npm run dev`、`npm run build`）
- 部署说明（Cloudflare Pages）
- 后续扩展指引（如何加新房间）

---

## 九、不要做的事

- **不要迁移三个房间的业务逻辑**（这是 P1/P2/P3 的事）
- **不要修改 Supabase 数据库结构或表**
- **不要删除或修改原有的 workout/、study/、health/ 目录**（保持兼容，老线上版本继续可访问）
- **不要使用 Tailwind v4 或 lucide-react latest**
- **不要在 jsx 里硬编码 #hex 颜色**（颜色都从 CSS 变量来；唯一例外是 LoginPage 的背景渐变和 RoomCard 内的 color/colorSoft 是从 props 传入的）
- **不要给 HallPage 加 `data-room` 属性**
- **不要在大厅或登录页放鸡汤口号**（如「每日精进」「记录是为了看见」之类），保持克制

---

## 十、验收清单（请逐项自测）

1. ☐ `npm install` 无报错
2. ☐ `npm run dev` 启动后能访问 `http://localhost:5173`
3. ☐ 未登录时访问 `/hall` 自动跳转到 `/`
4. ☐ 输入正确账号密码能登录，跳到 `/hall`
5. ☐ 输入错误密码显示错误提示
6. ☐ 点击「无账号，仅查看数据」也能进入大厅
7. ☐ 大厅顶部正确显示标题「电子生存数据」、副标题「EST. 2026 · WXH」、当前日期、星期
8. ☐ 大厅显示 3 张房间卡片，每张主题色不同（橙 / 蓝 / 绿）
9. ☐ 卡片 hover 有上浮动画
10. ☐ 点击「健身房」卡片，进入 `/gym`，整体配色变成米黄+赭红
11. ☐ 点击「书房」卡片，进入 `/study`，整体配色变成蓝白+蓝
12. ☐ 点击「客厅」卡片，进入 `/living`，整体配色变成嫩绿+绿
13. ☐ 各房间内 TopBar 的「← 大厅」按钮能正常返回
14. ☐ 返回大厅后配色变回中性
15. ☐ 访客模式下大厅顶部显示「访客模式 · 只读」标签
16. ☐ `npm run build` 通过，dist/ 目录生成
17. ☐ `npm run preview` 能预览构建产物
18. ☐ 移动端宽度（<480px）下大厅卡片单列堆叠，桌面 3 列

---

## 十一、提交时

完成后请告诉我：

- 创建了哪些文件
- 测试时的截图（至少包含登录页、大厅、三个房间的占位页）
- 如果有任何决策上的偏离我的要求，请明确说明原因

如果在执行过程中发现我的指令有矛盾或不清晰的地方，请先停下来问我，不要自己拍板。
