# 🍅 洋柿子 (Tomato Vibe)

> **极简、优雅、沉浸的番茄工作法助手。**  
> 别具一格的视觉体验，让每一次专注都充满仪式感。

[**🌍 立即体验 (Vercel)**](https://tomato-vibe.vercel.app/)

---

## ✨ 核心特性

- 🍅 **氛围计时器**: 精心设计的计时界面，支持自定义工作、短休与长休时长。
- 🎵 **沉浸式白噪音**: 内置雨声、咖啡馆环境音，助你快速进入心流状态。
- 📝 **智能任务管理**: 支持拖拽排序，直观记录每个任务消耗的番茄数。
- 🧘 **久坐提醒**: 贴心的健康伴侣，在长时间专注后提醒你稍作休息。
- 📊 **专注数据看板**: 通过热力图（Heatmap）与历史轨迹直观展示你的专注历程。
- ☁️ **云端实时同步**: 基于 Supabase 实现多端数据无缝流转。
- 🌌 **极致美学设计**: 采用 Glassmorphism（磨砂玻璃）风格，全屏沉浸模式，丝滑的 Framer Motion 动效。

## 🛠️ 技术栈

本项目基于现代 Web 技术栈构建，致力于提供最顶级的开发与使用体验：

- **核心框架**: [Next.js 15+](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **类型安全**: [TypeScript](https://www.typescriptlang.org/)
- **样式方案**: [Tailwind CSS 4](https://tailwindcss.com/)
- **动效引擎**: [Framer Motion](https://www.framer.com/motion/)
- **后端云服务**: [Supabase](https://supabase.com/) (Auth, Database)
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

### 3. 安装并运行

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
| **增加时长** | `+` / `=` |
| **减少时长** | `-` |

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。
