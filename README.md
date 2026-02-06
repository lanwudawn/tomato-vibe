# 🍅 洋柿子 (Tomato Vibe)

> **极简、优雅、沉浸的番茄工作法助手。**  
> 别具一格的视觉体验，让每一次专注都充满仪式感。

---

## ✨ 核心特性

- 🍅 **氛围计时器**: 精心设计的计时界面，支持自定义工作、短休与长休时长。
- 🎵 **沉浸式白噪音**: 内置森林、雨声、潮汐等高品质白噪音，助你快速进入心流状态。
- 📝 **智能任务管理**: 支持拖拽排序及优先级设定，直观的“洋柿子”预估值展示。
- 🧘 **久坐提醒**: 贴心的健康伴侣，在长时间专注后提醒你站立拉伸或稍作休息。
- 📊 **专注数据看板**: 通过热力图（Heatmap）与历史轨迹直观展示你的专注历程。
- ☁️ **云端实时同步**: 基于 Supabase 实现多端数据无缝流转，保护你的每一分钟专注记录。
- 🌌 **极致美学设计**: 采用 Glassmorphism（磨砂玻璃）风格，全屏沉浸模式，丝滑的 Framer Motion 动效。

## 🛠️ 技术栈

本项目基于现代 Web 技术栈构建，致力于提供最顶级的开发与使用体验：

- **核心框架**: [Next.js 15+](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **类型安全**: [TypeScript](https://www.typescriptlang.org/)
- **样式方案**: [Tailwind CSS 4](https://tailwindcss.com/) (极致简洁与高性能)
- **动效引擎**: [Framer Motion](https://www.framer.com/motion/)
- **后端云服务**: [Supabase](https://supabase.com/) (Auth, Database, Edge Functions)
- **拖拽交互**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **图标组件**: [Lucide React](https://lucide.dev/)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lanwudawn/tomato-vibe.git
cd tomato-vibe
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件，并填入你的 Supabase 配置：

```text
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目地址
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名Key
```

### 3. 初始化数据库

你可以使用 `supabase/schema.sql` 中的 SQL 脚本在 Supabase 控制台中初始化数据库表结构。

### 4. 安装并运行

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可开启你的专注之旅。

## ⌨️ 快捷键说明

| 功能 | 快捷键 |
| :--- | :--- |
| **开始 / 暂停** | `Space` |
| **重置计时** | `R` |
| **增加 5 分钟** | `+` / `=` |
| **减少 5 分钟** | `-` |

## 🎨 设计理念

“洋柿子”不仅是一个工具，更是一种生活态度。我们摒弃了传统计时器的冰冷感，采用柔和的色彩、极简的排版以及人性化的微动效。每一个细节都经过推敲，旨在减少视觉干扰，增加专注带来的愉悦感。

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

