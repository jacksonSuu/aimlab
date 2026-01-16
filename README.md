# AIMlab（前端）

这是一个面向 **FPS 瞄准训练 / 反应训练** 的 Web 前端原型（灵感来自 Steam 上常见的 Aim Lab 类产品）。

当前已实现：

- Landing 首页（训练入口 + 模式规划）
- `/trainer` 训练场：**静态点击（Click）**
	- 命中 / 失误统计
	- 命中率
	- 平均反应时间、最佳反应时间、中位数反应时间
	- 可调：训练时长、目标大小、目标间隔

> 说明：本项目名为 **AIMlab**，仅用于原型/学习，不隶属于任何商业 Aim Lab 品牌。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

## 📦 部署方式

### 方式 1: GitHub Actions 自动部署（推荐）

📖 **详细指南**：[GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md)

适合持续集成和自动化部署，每次推送代码自动部署到服务器。

### 方式 2: 手动部署到服务器

📖 **详细指南**：[DEPLOYMENT.md](./DEPLOYMENT.md)

适合一次性部署或测试环境。

## 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- Turbopack

## 路由

- `/`：首页
- `/trainer`：训练场（静态点击）

## 目录结构（关键）

- `src/app/page.tsx`：首页
- `src/app/trainer/page.tsx`：训练页路由
- `src/app/trainer/trainer-client.tsx`：训练核心交互（client component）
- `src/components/ui/*`：基础 UI 组件（Navbar/Footer/Button）

## 后续扩展建议（如果你要做成“真·Aim Lab”）

1) **移动追踪（Tracking）**：用 `requestAnimationFrame` 更新目标位置，统计跟枪稳定性（偏移/抖动/在目标内停留时间）。

2) **甩枪/切枪（Flick / Switching）**：多个目标队列 + 目标优先级，统计每次切换反应时间与过冲。

3) **输入一致性**：可选接入 Pointer Lock（锁定指针）、可调 FOV 与 sensitivity 映射。

4) **数据持久化与排行**：把每局训练结果存到后端（例如你的 `TurnitinServer`），做个人历史曲线/周报。

5) **桌面端**：如果想接近 Steam 产品体验，可用 Electron/Tauri 打包为桌面应用。

