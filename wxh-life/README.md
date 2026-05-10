# wxh-life

wxh 的电子生存数据新入口。P0 阶段只搭建 Vite + React 骨架、统一登录入口、大厅导航和三个房间占位页，暂不迁移旧业务逻辑。

## 房间体系

- 大厅：登录后的中枢页面，展示所有房间入口。
- 健身房：后续承接 `workout/index.html` 的运动日志。
- 书房：后续承接 `study/index.html` 的学习日志。
- 卧室：后续承接 `health/index.html` 的健康日志。

## 启动

```bash
npm install
npm run dev
npm run build
```

本地开发默认访问 `http://localhost:5173`。

## 部署

Cloudflare Pages 使用 `npm run build` 作为构建命令，输出目录为 `dist`。`_redirects` 已配置 SPA 路由回退。

## 添加新房间

1. 在 `src/pages` 下新增房间页面，并在根元素设置新的 `data-room`。
2. 在 `src/styles/tokens.css` 中添加同名主题变量。
3. 在 `src/pages/HallPage.jsx` 的 `ROOMS` 数组增加入口配置。
4. 在 `src/App.jsx` 增加对应路由。
