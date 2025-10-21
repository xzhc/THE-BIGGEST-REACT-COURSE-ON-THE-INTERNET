# React 项目工程化配置

> 从零开始手动配置 React + Vite 项目，理解每个环节

---

## 为什么要手动配置？

虽然可以用 `create-react-app` 或 `npm create vite@latest`，但手动配置能让你：
- 理解项目结构的每个部分
- 知道每个配置文件的作用
- 掌握项目的工程化流程
- 在遇到问题时能快速定位

**建议：** 前几个项目手动配置理解原理，后续可以使用脚手架提高效率

---

## 完整配置流程

### 1. 初始化 package.json

```bash
npm init -y
```

**关键字段：**
```json
{
  "name": "project-name",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

### 2. 安装核心依赖

```bash
# React 核心
npm install react react-dom

# 开发工具
npm install -D vite @vitejs/plugin-react
```

**为什么分两个包？**
- `react`: 核心库，跨平台（Web/Native/VR）
- `react-dom`: DOM 渲染器，专门用于 Web

**为什么用 Vite？**
- 比 Webpack 快（基于 ESM）
- 配置简单
- 开箱即用的 HMR（热模块替换）

---

### 3. 创建 vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // 自定义端口
    open: true         // 自动打开浏览器
  }
})
```

**核心配置：**
- `plugins: [react()]` - 支持 JSX 和 Fast Refresh
- `server.port` - 开发服务器端口
- `server.open` - 是否自动打开浏览器

---

### 4. 创建 index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**关键点：**
- `<div id="root">` - React 挂载点
- `type="module"` - 启用 ES6 模块
- `/src/main.jsx` - Vite 会自动处理

---

### 5. 创建 src/main.jsx

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**React 18 新 API：**
- `createRoot` 替代了 `ReactDOM.render`
- `StrictMode` - 开发模式的额外检查（会导致组件渲染两次）

---

### 6. 创建 src/App.jsx

```javascript
function App() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  )
}

export default App
```

---

### 7. 运行项目

```bash
npm run dev
```

访问 `http://localhost:3000`

---

## 常见配置扩展

### TypeScript 支持

```bash
npm install -D typescript @types/react @types/react-dom
```

创建 `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

### CSS 预处理器

```bash
# Sass
npm install -D sass

# Less
npm install -D less
```

直接在组件中导入 `.scss` 或 `.less` 文件即可

---

### 路径别名

在 `vite.config.js` 中：
```javascript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  }
})
```

使用：
```javascript
import Button from '@/components/Button'
```

---

## 目录结构建议

```
project-root/
├── public/              # 静态资源（不经过构建）
│   └── favicon.ico
├── src/
│   ├── components/      # 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── utils/          # 工具函数
│   ├── styles/         # 全局样式
│   ├── App.jsx         # 根组件
│   └── main.jsx        # 入口文件
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置
└── package.json        # 项目配置
```

---

## npm 版本号规则

`^18.2.0` 的含义：
- `18` - 主版本（不兼容的 API 变更）
- `2` - 次版本（向后兼容的新功能）
- `0` - 补丁版本（向后兼容的 bug 修复）
- `^` - 允许更新次版本和补丁版本

示例：
- `^18.2.0` → 可更新到 `18.9.9`，但不会到 `19.0.0`
- `~18.2.0` → 只更新补丁版本，最多到 `18.2.x`

---

## 常见问题

### Q: 为什么需要 StrictMode？
A: 帮助发现潜在问题（不安全的生命周期、过时的 API 等），只在开发模式生效

### Q: 为什么组件渲染两次？
A: StrictMode 的特性，用于检测副作用，生产环境不会

### Q: src 目录是必需的吗？
A: 不是必需，但这是约定俗成的规范，便于团队协作

### Q: Vite vs Webpack 怎么选？
A: 新项目推荐 Vite（快、简单），复杂项目或老项目可能需要 Webpack

---

## 快速模板

熟悉配置后，可以创建模板快速初始化：

```bash
# 使用 Vite 官方模板
npm create vite@latest my-app -- --template react

# 或 TypeScript
npm create vite@latest my-app -- --template react-ts
```

**但建议前几个项目还是手动配置，加深理解**

---

## 相关资源

- [Vite 官方文档](https://vitejs.dev)
- [React 官方文档](https://react.dev)
- [npm 版本管理](https://docs.npmjs.com/about-semantic-versioning)

