# MyData

个人数据管理项目（仅限wxh使用）。

## 已实现
- 运动日志：https://wxhdata-workout.pages.dev/
- 学习日志：https://wxhdata-study.pages.dev/
- 健康日志：https://wxhdata-health.pages.dev/

## 项目说明
- 目标：记录和管理个人日常数据，当前主要用于个人自我追踪与复盘。
- 使用范围：目前仅用于个人，不面向公开多用户场景。
- 部署方式：基于 GitHub + Cloudflare Pages 自动部署。

## 当前模块
- `workout/`：运动日志模块（训练记录、打卡等）。
- `study/`：学习计划与学习记录模块。

## 部署配置（Cloudflare Pages）
- Git 仓库：`wxhxyyzm/MyData`
- 生产分支：`master`
- 自动部署：开启（推送到 `master` 后自动部署）
- Build command：留空
- Build output directory：`study`（当前线上入口）

## 本地更新流程
1. 修改文件。
2. 提交并推送：
   - `git add .`
   - `git commit -m "update"`
   - `git push`
3. Cloudflare 自动拉取并部署。

