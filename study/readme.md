# WXH 学习日志 — 项目技术文档

> 本文档描述「WXH的学习日志」Web App 的完整数据结构、代码规范和扩展方法。
> 任何 AI 或开发者接手时，请先完整阅读本文档再做修改。

---

## 一、项目概述

一个面向个人的学习计划追踪系统，支持多个独立学习项目（如 LLM 学习、健身计划等）。

- **技术栈**：纯 HTML 单文件，React 18（Babel standalone），Tailwind CSS CDN，Lucide 图标，Supabase 数据库
- **部署方式**：单个 `index.html` 文件，托管在 Cloudflare Pages
- **数据库**：Supabase（PostgreSQL），项目 URL `https://ettxqjdtrbjqoctwmprw.supabase.co`
- **图标版本**：`lucide@0.292.0`（已锁定版本，不要改成 latest）

---

## 二、数据库结构

### 表 1：`study_projects`（计划项目表）

每一行代表一个独立的学习计划（如"LLM 学习"、"健身"等）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text (PK) | 项目唯一标识，**手动指定短字符串**，如 `llm`、`fitness`、`english` |
| `name` | text | 显示名称，如 `LLM 学习` |
| `emoji` | text | 项目 emoji 图标，如 `🤖` |
| `color` | text | 主题色 hex，如 `#2563eb` |
| `description` | text | 项目简介，显示在主界面卡片上 |
| `archived` | boolean | 是否已归档，默认 `false` |
| `archived_at` | timestamptz | 归档时间，归档时写入 |
| `summary` | text | 归档时写的总结文字 |
| `created_at` | timestamptz | 创建时间，默认 `now()` |

**目前已有项目：**

```
id: 'llm'
name: 'LLM 学习'
emoji: '🤖'
color: '#2563eb'
description: '大模型算法岗学习计划'
```

---

### 表 2：`study_logs`（打卡记录表）

每一行代表用户对某个计划任务的一次打卡。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | bigint (PK) | 由前端生成：`Date.now() * 1000 + random(0~999)` |
| `project_id` | text | 关联 `study_projects.id`，默认 `'llm'` |
| `item_id` | text | 关联计划任务的 id，如 `m1-1`、`m2-4`（见下方计划结构） |
| `date` | text | 打卡日期，格式 `YYYY-MM-DD`，如 `2026-05-05` |
| `note` | text | 打卡备注，可为空字符串 |
| `created_at` | timestamptz | 记录创建时间 |

**重要约束：** 同一个 `item_id` + 同一个 `date` 前端会阻止重复打卡，但数据库层没有唯一约束，由前端逻辑保证。

---

### 表 3：`study_notes`（难点与额外学习表）

两种用途共用一张表，用 `type` 字段区分：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | bigint (PK) | 同上，前端生成 |
| `project_id` | text | 关联 `study_projects.id` |
| `item_id` | text | 难点归属的任务 id（`type='note'` 时填写，`type='extra'` 时为 null） |
| `type` | text | `'note'`（计划内难点）或 `'extra'`（额外学习记录） |
| `content` | text | 难点描述 / 额外学习内容，最长 500 字 |
| `resolution` | text | 难点的解决方案（仅 `type='note'` 使用），可为空 |
| `resolved` | boolean | 难点是否已解决，默认 `false` |
| `created_at` | timestamptz | 记录创建时间（额外学习时此字段同时表示学习日期） |
| `resolved_at` | timestamptz | 标记解决的时间 |

---

### 表 4：`study_module_meta`（模块自定义字段表）

用于存储用户在 UI 上手动编辑的模块时间段说明。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | bigint (PK) | 前端生成 |
| `project_id` | text | 关联 `study_projects.id` |
| `module_id` | text | 模块 id，如 `m1`、`m2` |
| `subtitle` | text | 用户自定义的时间段，如 `5月初~5月底` |
| `updated_at` | timestamptz | 最后更新时间 |

---

## 三、计划内容结构（硬编码在前端）

**重要：计划内容（模块和任务列表）不存在数据库中，硬编码在 `index.html` 的 `PROJECT_PLANS` 对象里。**

数据库只存打卡记录、难点笔记、模块时间备注。

### 计划结构规范

```javascript
PROJECT_PLANS = {
  // key = study_projects.id
  "llm": [
    {
      id: "m1",              // 模块 id，同一项目内唯一，格式 m1/m2/m3...
      title: "第一阶段：...", // 模块标题
      defaultSubtitle: "约 4 周",  // 默认时间说明（用户可在 UI 覆盖）
      emoji: "🧱",           // 模块 emoji
      color: "#2563eb",      // 模块主题色（hex）
      colorSoft: "#dbeafe",  // 模块浅色背景（hex，用于 emoji 背景）
      items: [
        {
          id: "m1-1",        // 任务 id，格式：模块id-序号，同一项目内全局唯一
          type: "video",     // 类型：video | code | read
          title: "...",      // 任务标题（简短）
          desc: "...",       // 任务描述（详细说明、链接文字等）
          url: "https://...",// 可选，外链
        },
        // ...
      ]
    },
    // ...
  ]
}
```

### ⚠️ 关键规则：item id 不能修改

`item_id` 是打卡记录和难点记录的外键。**一旦某个任务被打过卡，其 `id` 就不能再改**，否则历史记录会变成"已删除的条目"。

- 添加新任务：在末尾追加，id 递增（如现有到 `m1-17`，新增用 `m1-18`）
- 删除任务：不要真的删除，把 title 改成"（已移除）"或直接留着
- 修改任务内容：可以随意改 title/desc/url，id 保持不变

---

## 四、目前 LLM 项目的任务 id 清单

用于新增任务时确认不重复：

```
m1-1  ~ m1-17   （第一阶段，共17个）
m2-1  ~ m2-16   （第二阶段，共16个）
m3-1  ~ m3-7    （第三阶段，共7个）
m4-1  ~ m4-11   （第四阶段，共11个）
```

**新增任务时从 `m4-12` 往后追加，或在对应阶段末尾追加。**

---

## 五、添加新计划的完整步骤

假设要添加一个「英语学习」计划：

### Step 1：数据库插入新项目

在 Supabase SQL Editor 运行：

```sql
INSERT INTO study_projects (id, name, emoji, color, description)
VALUES ('english', '英语学习', '🇬🇧', '#0891b2', '雅思备考计划');
```

`id` 用简短英文，全小写，不含空格。

### Step 2：在 `index.html` 中添加计划内容

找到 `PROJECT_PLANS` 对象，在 `llm: [...]` 后面追加：

```javascript
PROJECT_PLANS = {
  llm: [ /* 已有内容，不动 */ ],

  english: [
    {
      id: "e1",
      title: "第一阶段：词汇基础",
      defaultSubtitle: "约 4 周",
      emoji: "📖",
      color: "#0891b2",
      colorSoft: "#cffafe",
      items: [
        {
          id: "e1-1",
          type: "read",
          title: "单词书：第1-50页",
          desc: "每天50个单词，配合 Anki 记忆",
        },
        // ...
      ]
    }
  ]
}
```

**注意：** 新项目的模块 id 和任务 id 只需在本项目内唯一，不同项目可以重复使用 `m1`、`e1-1` 等。但建议新项目用不同前缀（`e`=英语，`f`=健身，`p`=编程等）避免混淆。

### Step 3：部署

把改好的 `index.html` 推到 GitHub，Cloudflare Pages 自动部署。

---

## 六、RLS 策略

所有表均已开启 Row Level Security，并配置了 `allow all` 策略（个人使用，无需鉴权）：

```sql
CREATE POLICY "allow all" ON study_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON study_logs      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON study_notes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON study_module_meta FOR ALL USING (true) WITH CHECK (true);
```

---

## 七、UI 主题色规范

应用整体使用蓝色冷色调：

```css
--bg:       #f0f4ff   /* 页面背景 */
--bg-card:  #f8faff   /* 卡片背景 */
--ink:      #0f1c3f   /* 主文字 */
--ink-soft: #3d5080   /* 次要文字 */
--ink-faint:#8a9cc2   /* 辅助文字 */
--accent:   #2563eb   /* 主题色（蓝） */
--line:     #d5e0f7   /* 分割线 */
```

各阶段模块有独立颜色，目前 LLM 项目使用：
- 第一阶段：`#2563eb`（蓝）
- 第二阶段：`#0284c7`（天蓝）
- 第三阶段：`#0891b2`（青）
- 第四阶段：`#4f46e5`（靛紫）

新项目可以选完全不同的颜色体系（如绿色、橙色），各项目视觉上独立。

---

## 八、字体

通过 Google Fonts 加载，三种字体各司其职：

- **Fraunces**：标题、数字（`.display` class）
- **Manrope**：正文、按钮（`--font-body`）
- **JetBrains Mono**：时间、标签、统计数字（`.mono` class）

---

*最后更新：2026年5月*
