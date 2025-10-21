# 🔧 项目运行环境配置指南

> 这个课程的大部分代码文件**没有配置文件**，需要我们自己搭建运行环境

---

## 📋 项目结构现状

### ✅ 有完整配置的项目
这些项目可以直接 `npm install && npm run dev`：
- `11. Redux Toolkit/` 所有子项目
- `17. Small Packages/` 所有子项目
- `18. Build Your Own Component Library/`
- `19. Monorepos/`
- `20. React Design System/`
- `21. React Auth/`

### ⚠️ 只有源码没有配置的项目
这些项目只有 `.jsx` 或 `.tsx` 文件，**需要自己配置环境**：
- `01. Fundamentals/` 所有示例
- `02. React Hooks/` 所有示例
- `03. Beginners Projects/` 所有项目
- `04. React w TypeScript/` 所有示例
- `09. Framer Motion/` 大部分示例
- `10. Zustand With 10 Projects/2. Projects/` 所有项目

---

## 🎯 三种运行方式（推荐程度）

### 方式一：使用在线工具 ⭐⭐⭐⭐⭐ （最推荐）

**优点：**
- ✅ 零配置，立即运行
- ✅ 在线分享和保存
- ✅ 不占用本地空间

#### 1. CodeSandbox（推荐）

**操作步骤：**
1. 访问：https://codesandbox.io/
2. 创建 React 项目（选择 Vite + React）
3. 复制粘贴代码文件
4. 立即运行

**示例：Counter 项目**
```
1. 新建 Vite React 项目
2. 替换 src/App.jsx 内容
3. 添加 src/Counter.jsx
4. 添加 src/style.css
5. 自动运行
```

#### 2. StackBlitz（也很好）

网址：https://stackblitz.com/
操作类似 CodeSandbox

---

### 方式二：一次性配置通用模板 ⭐⭐⭐⭐ （本地开发推荐）

**思路：创建一个通用的 React 项目模板，复制粘贴代码进去运行**

#### 第一步：创建通用模板（只需做一次）

```bash
# 在项目根目录创建模板目录
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
mkdir _template-react
cd _template-react

# 使用 Vite 创建 React 项目
npm create vite@latest . -- --template react

# 安装依赖
npm install

# 测试运行
npm run dev
```

#### 第二步：使用模板运行任意项目

**示例：运行 Counter 项目**

```bash
# 1. 复制模板
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
cp -r _template-react "my-experiments/counter-app"

cd "my-experiments/counter-app"

# 2. 复制源码
# 将 "03. Beginners Projects/01. Counter/" 下的文件复制到 src/

# 3. 修改 src/main.jsx
# 确保正确导入 App.jsx

# 4. 运行
npm run dev
```

---

### 方式三：为每个项目单独配置 ⭐⭐⭐ （学习配置用）

**适合场景：想深入理解项目配置**

#### 完整配置步骤

##### 1. 创建基础文件结构

```bash
# 以 Counter 项目为例
cd "03. Beginners Projects/01. Counter"

# 初始化项目
npm init -y

# 安装依赖
npm install react react-dom
npm install -D vite @vitejs/plugin-react
```

##### 2. 创建 `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

##### 3. 创建 `index.html`

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

##### 4. 创建 `src/main.jsx`

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

##### 5. 调整项目文件

```bash
# 创建 src 目录
mkdir src

# 移动源码到 src/
mv App.jsx src/
mv Counter.jsx src/
mv style.css src/
```

##### 6. 更新 `package.json` 的 scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

##### 7. 运行项目

```bash
npm run dev
```

---

## 🎯 推荐方案总结

### 📌 快速学习代码 → 方式一（在线工具）

**适合：**
- 只想看效果和理解代码
- 不想折腾配置
- 需要快速验证想法

**工作流：**
```
1. 打开 CodeSandbox
2. 创建 React 模板
3. 粘贴代码
4. 运行查看
```

---

### 📌 本地深度学习 → 方式二（通用模板）

**适合：**
- 想在本地修改和调试
- 需要提交到 Git
- 想积累自己的代码

**工作流：**
```
1. 创建通用模板（一次性）
2. 复制模板到 my-experiments/
3. 粘贴源码
4. 修改和改进
5. 提交到 Git
```

---

### 📌 学习项目配置 → 方式三（完整配置）

**适合：**
- 想理解项目配置原理
- 准备自己创建项目
- 学习 Vite/Webpack 等工具

---

## 🚀 立即行动：创建通用模板

让我帮你创建一个通用的 React 模板，以后可以直接复制使用：

### 第一步：创建模板（执行一次）

```bash
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"

# 创建模板目录
mkdir _template-react-js
cd _template-react-js

# 使用 Vite 创建 React 项目
npm create vite@latest . -- --template react

# 安装依赖
npm install

# 测试
npm run dev
```

### 第二步：创建 TypeScript 模板（可选）

```bash
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"

mkdir _template-react-ts
cd _template-react-ts

# TypeScript 模板
npm create vite@latest . -- --template react-ts

npm install
npm run dev
```

---

## 📝 使用模板的完整示例

### 示例：运行 Counter 项目

#### 方法 1：复制整个模板

```powershell
# 1. 复制模板
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
Copy-Item -Recurse "_template-react-js" "my-experiments\counter-app"

cd "my-experiments\counter-app"

# 2. 清空 src 目录的示例代码
Remove-Item src\App.jsx, src\App.css, src\index.css

# 3. 复制 Counter 项目的代码到 src/
Copy-Item "../03. Beginners Projects/01. Counter/App.jsx" src/
Copy-Item "../03. Beginners Projects/01. Counter/Counter.jsx" src/
Copy-Item "../03. Beginners Projects/01. Counter/style.css" src/

# 4. 修改 src/main.jsx（如果需要）
# 确保导入了正确的文件

# 5. 运行
npm run dev
```

#### 方法 2：只复制 src 内容（更快）

```powershell
cd "my-experiments\counter-app"

# 删除旧的 src 内容
Remove-Item src\* -Recurse

# 复制新的源码
Copy-Item "../03. Beginners Projects/01. Counter/*" src/

# 创建 main.jsx
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

# 运行
npm run dev
```

---

## 🎓 TypeScript 项目怎么运行？

对于 `.tsx` 文件的项目（如 Zustand, Framer Motion）：

### 使用 TypeScript 模板

```bash
# 1. 复制 TypeScript 模板
Copy-Item -Recurse "_template-react-ts" "my-experiments\zustand-notes-app"

cd "my-experiments\zustand-notes-app"

# 2. 复制源码
Copy-Item -Recurse "../10. Zustand With 10 Projects/2. Projects/1. Notes App/*" src/

# 3. 如果缺少 main.tsx，创建它
@"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@ | Out-File -FilePath "src/main.tsx" -Encoding utf8

# 4. 安装 Zustand
npm install zustand

# 5. 运行
npm run dev
```

---

## 💡 常见问题

### Q1: 每个项目都要重新安装依赖吗？

**A:** 如果使用模板方式：
- 复制整个模板 → 依赖已经在 `node_modules/` 里，不需要重装
- 只复制 src → 需要运行 `npm install`

**建议：** 复制整个模板目录，速度更快

---

### Q2: 怎么知道项目需要哪些额外依赖？

**A:** 看代码的 import 语句：

```jsx
import { create } from 'zustand'  // → npm install zustand
import { motion } from 'framer-motion'  // → npm install framer-motion
import { useQuery } from '@tanstack/react-query'  // → npm install @tanstack/react-query
```

**通用依赖：**
- React 基础：`react`, `react-dom`
- Zustand 项目：+ `zustand`
- Framer Motion：+ `framer-motion`
- Redux：+ `@reduxjs/toolkit`, `react-redux`
- React Query：+ `@tanstack/react-query`

---

### Q3: 我不想每次都复制模板，有没有更快的方法？

**A:** 使用 CodeSandbox 或 StackBlitz 在线工具，零配置！

---

## 🎯 我的推荐

根据你的学习方式（直接上手代码，不看视频），我建议：

### 方案 A：在线工具 + 本地笔记 ⭐⭐⭐⭐⭐

```
1. 在 CodeSandbox 运行代码（快速）
2. 理解原理后，写笔记到 my-notes/
3. 如果要改进，复制模板到 my-experiments/
4. 提交笔记和改进代码到 Git
```

**优点：**
- 学习速度最快
- 零配置烦恼
- 专注理解代码

---

### 方案 B：本地模板 + 深度定制 ⭐⭐⭐⭐

```
1. 创建两个模板（JS + TS）
2. 每次学习新项目，复制模板
3. 粘贴源码，运行
4. 深度修改和改进
5. 提交到 Git
```

**优点：**
- 本地调试更方便
- 积累自己的代码库
- 学习配置原理

---

## 📚 相关资源

- **Vite 官方文档：** https://vitejs.dev/
- **CodeSandbox：** https://codesandbox.io/
- **StackBlitz：** https://stackblitz.com/
- **模板配置代码：** `my-notes/snippets/config-templates.js`

---

## ✅ 下一步行动

### 选择一种方式开始：

**🌐 在线工具方式：**
```
1. 打开 codesandbox.io
2. 创建 React 项目
3. 复制 Counter 代码
4. 运行并理解
5. 写笔记到 my-notes/
```

**💻 本地模板方式：**
```
1. 运行下面的命令创建模板
2. 测试 Counter 项目
3. 成功后继续学习其他项目
```

---

**需要我帮你创建本地模板吗？** 我可以立即执行命令！

---

**最后更新：** 2025-10-21

