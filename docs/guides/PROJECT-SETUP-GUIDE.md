# 🔧 单个项目配置完整指南

> 为每个没有配置的项目手动搭建运行环境

**适合场景：** 想深入理解项目配置，学习前端工程化

---

## 🎯 配置流程概览

```
1. 进入项目目录
2. 初始化 package.json
3. 安装依赖
4. 创建配置文件
5. 创建入口文件
6. 调整项目结构
7. 运行项目
```

**预计时间：** 每个项目 5-10 分钟（熟练后 3 分钟）

---

## 📋 完整配置步骤（通用模板）

### 示例项目：Counter

以 `03. Beginners Projects/01. Counter` 为例，完整演示配置过程。

---

### 第一步：进入项目目录

```powershell
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET\03. Beginners Projects\01. Counter"
```

---

### 第二步：初始化 package.json

```bash
npm init -y
```

**生成的 `package.json`：**
```json
{
  "name": "counter",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

### 第三步：安装依赖

#### 基础依赖（必需）

```bash
# React 核心
npm install react react-dom

# 开发工具（Vite）
npm install -D vite @vitejs/plugin-react
```

#### 根据项目类型安装额外依赖

**JavaScript 项目：** 只需上面的基础依赖

**TypeScript 项目：**
```bash
npm install -D typescript @types/react @types/react-dom
```

**Zustand 项目：**
```bash
npm install zustand
```

**Framer Motion 项目：**
```bash
npm install framer-motion
```

**Redux 项目：**
```bash
npm install @reduxjs/toolkit react-redux
```

---

### 第四步：创建配置文件

#### 4.1 创建 `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

**TypeScript 项目用 `vite.config.ts`：**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

#### 4.2 创建 `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Counter App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**TypeScript 项目：** 改为 `src="/src/main.tsx"`

#### 4.3 TypeScript 项目需要 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`：**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

### 第五步：创建入口文件

#### 5.1 创建 `src` 目录

```bash
mkdir src
```

#### 5.2 创建 `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**TypeScript 版本 `src/main.tsx`：**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### 第六步：调整项目结构

#### 6.1 移动源码到 src 目录

```powershell
# Counter 项目的文件移动
Move-Item App.jsx src/
Move-Item Counter.jsx src/
Move-Item style.css src/
```

#### 6.2 如果 CSS 导入路径需要调整

检查 `src/Counter.jsx` 中的 CSS 导入：
```jsx
import "./style.css";  // ✅ 正确，已经在同一目录
```

---

### 第七步：更新 package.json 脚本

修改 `package.json` 的 `scripts` 部分：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

### 第八步：运行项目

```bash
npm run dev
```

浏览器自动打开 http://localhost:3000 🎉

---

## ⚡ 快速配置脚本（复制使用）

### JavaScript 项目一键配置

创建文件：`setup-js-project.ps1`

```powershell
# PowerShell 脚本：setup-js-project.ps1
# 用法: .\setup-js-project.ps1

Write-Host "🚀 开始配置 React 项目..." -ForegroundColor Cyan

# 1. 初始化
npm init -y

# 2. 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
npm install react react-dom
npm install -D vite @vitejs/plugin-react

# 3. 创建 vite.config.js
Write-Host "📝 创建 vite.config.js..." -ForegroundColor Yellow
@"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
"@ | Out-File -FilePath "vite.config.js" -Encoding utf8

# 4. 创建 index.html
Write-Host "📝 创建 index.html..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "index.html" -Encoding utf8

# 5. 创建 src 目录
Write-Host "📁 创建 src 目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src" | Out-Null

# 6. 创建 main.jsx
Write-Host "📝 创建 main.jsx..." -ForegroundColor Yellow
@"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@ | Out-File -FilePath "src/main.jsx" -Encoding utf8

# 7. 移动现有文件到 src/
Write-Host "📦 移动源码到 src/..." -ForegroundColor Yellow
Get-ChildItem -Filter "*.jsx" | Where-Object { $_.Name -ne "main.jsx" } | Move-Item -Destination "src/" -Force
Get-ChildItem -Filter "*.css" | Move-Item -Destination "src/" -Force

# 8. 更新 package.json scripts
Write-Host "📝 更新 package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts = @{
    "dev" = "vite"
    "build" = "vite build"
    "preview" = "vite preview"
}
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Write-Host "✅ 配置完成！运行 'npm run dev' 启动项目" -ForegroundColor Green
```

**使用方法：**
```powershell
cd "03. Beginners Projects/01. Counter"
..\..\..\setup-js-project.ps1
npm run dev
```

---

### TypeScript 项目一键配置

创建文件：`setup-ts-project.ps1`

```powershell
# PowerShell 脚本：setup-ts-project.ps1

Write-Host "🚀 开始配置 React TypeScript 项目..." -ForegroundColor Cyan

# 1. 初始化
npm init -y

# 2. 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# 3. 创建 vite.config.ts
@"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
"@ | Out-File -FilePath "vite.config.ts" -Encoding utf8

# 4. 创建 tsconfig.json
@"
{
  \"compilerOptions\": {
    \"target\": \"ES2020\",
    \"useDefineForClassFields\": true,
    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],
    \"module\": \"ESNext\",
    \"skipLibCheck\": true,
    \"moduleResolution\": \"bundler\",
    \"allowImportingTsExtensions\": true,
    \"resolveJsonModule\": true,
    \"isolatedModules\": true,
    \"noEmit\": true,
    \"jsx\": \"react-jsx\",
    \"strict\": true,
    \"noUnusedLocals\": true,
    \"noUnusedParameters\": true,
    \"noFallthroughCasesInSwitch\": true
  },
  \"include\": [\"src\"],
  \"references\": [{ \"path\": \"./tsconfig.node.json\" }]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding utf8

# 5. 创建 tsconfig.node.json
@"
{
  \"compilerOptions\": {
    \"composite\": true,
    \"skipLibCheck\": true,
    \"module\": \"ESNext\",
    \"moduleResolution\": \"bundler\",
    \"allowSyntheticDefaultImports\": true
  },
  \"include\": [\"vite.config.ts\"]
}
"@ | Out-File -FilePath "tsconfig.node.json" -Encoding utf8

# 6. 创建 index.html
@"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@ | Out-File -FilePath "index.html" -Encoding utf8

# 7. 创建 src 目录
New-Item -ItemType Directory -Force -Path "src" | Out-Null

# 8. 创建 main.tsx
@"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@ | Out-File -FilePath "src/main.tsx" -Encoding utf8

# 9. 移动源码
Get-ChildItem -Filter "*.tsx" | Where-Object { $_.Name -ne "main.tsx" } | Move-Item -Destination "src/" -Force
Get-ChildItem -Filter "*.ts" | Where-Object { $_.Name -notlike "*.config.ts" -and $_.Name -notlike "tsconfig*" } | Move-Item -Destination "src/" -Force
Get-ChildItem -Filter "*.css" | Move-Item -Destination "src/" -Force

# 10. 更新 package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts = @{
    "dev" = "vite"
    "build" = "tsc && vite build"
    "preview" = "vite preview"
}
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Write-Host "✅ 配置完成！运行 'npm run dev' 启动项目" -ForegroundColor Green
```

---

## 📝 配置检查清单

每次配置后，按此清单检查：

### ✅ 文件结构检查
```
项目目录/
├── node_modules/        ✅ 依赖已安装
├── src/
│   ├── App.jsx         ✅ 主组件
│   ├── main.jsx        ✅ 入口文件
│   └── *.css           ✅ 样式文件
├── index.html          ✅ HTML 模板
├── vite.config.js      ✅ Vite 配置
├── package.json        ✅ 包含正确的 scripts
└── package-lock.json   ✅ 锁定依赖版本
```

### ✅ package.json 检查
```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x"
  },
  "devDependencies": {
    "vite": "^5.x.x",
    "@vitejs/plugin-react": "^4.x.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### ✅ 运行测试
```bash
npm run dev  # ✅ 能正常启动
# 浏览器打开 http://localhost:3000
# ✅ 页面正常显示
# ✅ 功能正常工作
```

---

## 🎯 不同项目类型的配置差异

### 1. JavaScript 项目（最简单）
**依赖：**
```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react
```

**文件：**
- `vite.config.js`
- `index.html`（引用 `main.jsx`）
- `src/main.jsx`

---

### 2. TypeScript 项目

**额外依赖：**
```bash
npm install -D typescript @types/react @types/react-dom
```

**额外文件：**
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `index.html`（引用 `main.tsx`）
- `src/main.tsx`

---

### 3. Zustand 项目

**基于 TypeScript + 额外依赖：**
```bash
npm install zustand
```

**检查要点：**
- 看是否有 `store.ts` 或 `useXxxStore.ts`
- 确保导入路径正确

---

### 4. Framer Motion 项目

**基于 TypeScript + 额外依赖：**
```bash
npm install framer-motion
```

---

### 5. Redux 项目

**额外依赖：**
```bash
npm install @reduxjs/toolkit react-redux
```

---

## 💡 常见问题排查

### 问题 1：运行报错 "Cannot find module"

**原因：** 依赖未安装或导入路径错误

**解决：**
```bash
# 检查 package.json 的 dependencies
# 根据缺失的包安装
npm install 缺失的包名
```

---

### 问题 2：白屏或 "root not found"

**原因：** `index.html` 或 `main.jsx` 配置错误

**检查：**
1. `index.html` 中有 `<div id="root"></div>`
2. `main.jsx` 中 `document.getElementById('root')`
3. `index.html` 中脚本路径正确

---

### 问题 3：CSS 样式不生效

**原因：** CSS 文件路径错误或未导入

**检查：**
```jsx
// 在组件中检查 CSS 导入
import "./style.css"  // ✅ 相对路径正确
```

---

### 问题 4：TypeScript 类型错误

**解决：**
```bash
# 确保安装了类型定义
npm install -D @types/react @types/react-dom

# 检查 tsconfig.json 配置
```

---

## 🚀 实战演练

让我们一起配置第一个项目：

### 演练：配置 Counter 项目

```powershell
# 1. 进入目录
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET\03. Beginners Projects\01. Counter"

# 2. 检查现有文件
Get-ChildItem
# 应该看到：App.jsx, Counter.jsx, style.css

# 3. 如果已有 package-lock.json，先删除重新配置
Remove-Item package-lock.json, package.json -ErrorAction SilentlyContinue

# 4. 运行配置脚本（或手动执行步骤）
# 手动配置的话，按照上面的"完整配置步骤"执行

# 5. 运行项目
npm run dev
```

---

## 📚 学习收获

通过为每个项目单独配置，你会掌握：

### ✅ 技能收获
1. **Vite 工作原理** - 理解现代构建工具
2. **项目结构** - 知道每个文件的作用
3. **依赖管理** - 理解 package.json 和 npm
4. **TypeScript 配置** - 掌握 tsconfig.json
5. **模块系统** - 理解 ES Modules 和导入导出

### ✅ 实战经验
- 遇到配置问题时能独立解决
- 创建新项目时知道如何从零搭建
- 理解项目工程化的最佳实践

---

## 🎯 下一步

1. **立即行动**：配置你的第一个项目（Counter）
2. **记录笔记**：在 `my-notes/` 记录配置过程
3. **提炼模板**：总结出自己的配置流程
4. **持续优化**：每配置几个项目就优化一次脚本

---

**准备好开始了吗？** 需要我帮你配置第一个项目吗？我可以立即执行命令！

---

**最后更新：** 2025-10-21

