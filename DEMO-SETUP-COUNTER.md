# 🎯 实战演示：配置 Counter 项目

> 手把手教你配置第一个项目

---

## 📋 当前状态

Counter 项目位置：`03. Beginners Projects/01. Counter`

**现有文件：**
- `App.jsx` - 主组件
- `Counter.jsx` - Counter 组件
- `style.css` - 样式文件
- `package-lock.json` - 旧的锁定文件

**缺少文件：**
- ❌ `package.json` - 包配置
- ❌ `vite.config.js` - Vite 配置
- ❌ `index.html` - HTML 模板
- ❌ `src/main.jsx` - 入口文件

---

## 🚀 配置步骤

### 方法一：使用自动脚本（推荐）⚡

```powershell
# 1. 进入项目目录
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET\03. Beginners Projects\01. Counter"

# 2. 删除旧的 package-lock.json（如果存在）
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 3. 复制配置脚本到项目目录
Copy-Item "..\..\..\..\setup-js-project.ps1" .

# 4. 运行配置脚本
.\setup-js-project.ps1 -ProjectName "Counter App"

# 5. 等待依赖安装完成（可能需要几分钟）

# 6. 运行项目
npm run dev
```

**预计时间：** 5-10 分钟（主要是下载依赖）

---

### 方法二：手动配置（学习用）📝

#### 步骤 1：进入目录并清理

```powershell
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET\03. Beginners Projects\01. Counter"

# 删除旧的 lock 文件
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

#### 步骤 2：初始化 package.json

```bash
npm init -y
```

**生成的内容：**
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

#### 步骤 3：安装依赖

```bash
# React 核心（必需）
npm install react react-dom

# Vite 构建工具（必需）
npm install -D vite @vitejs/plugin-react
```

**安装后的 package.json：**
```json
{
  "name": "counter",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

#### 步骤 4：创建 vite.config.js

**新建文件：`vite.config.js`**
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

#### 步骤 5：创建 index.html

**新建文件：`index.html`**
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

#### 步骤 6：创建 src 目录和入口文件

```powershell
# 创建 src 目录
New-Item -ItemType Directory -Path "src"

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
```

#### 步骤 7：移动源码到 src 目录

```powershell
# 移动 JSX 文件
Move-Item App.jsx src/
Move-Item Counter.jsx src/

# 移动 CSS 文件
Move-Item style.css src/
```

#### 步骤 8：更新 package.json 的 scripts

**编辑 `package.json`，修改 `scripts` 部分：**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 步骤 9：运行项目

```bash
npm run dev
```

**预期输出：**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

浏览器自动打开 http://localhost:3000，看到 Counter 应用！🎉

---

## ✅ 配置完成后的项目结构

```
01. Counter/
├── node_modules/          ✅ 依赖已安装
├── src/
│   ├── App.jsx           ✅ 主组件
│   ├── Counter.jsx       ✅ Counter 组件
│   ├── main.jsx          ✅ 入口文件
│   └── style.css         ✅ 样式
├── index.html            ✅ HTML 模板
├── vite.config.js        ✅ Vite 配置
├── package.json          ✅ 包配置
└── package-lock.json     ✅ 依赖锁定
```

---

## 🎓 学到了什么？

### 1. Vite 的作用
- 快速的开发服务器
- 热模块替换（HMR）- 修改代码立即看到效果
- 生产构建优化

### 2. 项目结构
- `src/` - 源码目录
- `index.html` - 应用入口
- `main.jsx` - React 应用的挂载点
- `vite.config.js` - 构建工具配置

### 3. 依赖管理
- `dependencies` - 生产环境依赖（React）
- `devDependencies` - 开发工具（Vite）
- `package-lock.json` - 锁定具体版本

---

## 🔧 常见问题

### Q1: 运行 `npm run dev` 报错？

**可能原因：**
1. 依赖未安装完成 → 重新运行 `npm install`
2. Node.js 版本太旧 → 升级到 16+
3. 端口被占用 → 修改 `vite.config.js` 中的端口

---

### Q2: 页面空白？

**检查：**
1. 浏览器控制台有没有错误
2. `index.html` 中 `<div id="root"></div>` 是否存在
3. `main.jsx` 中 `document.getElementById('root')` 是否正确

---

### Q3: CSS 样式不生效？

**检查：**
```jsx
// Counter.jsx 中
import "./style.css"  // ✅ 确保路径正确
```

---

## 🎯 下一步

### 继续配置其他项目

使用同样的方法配置其他项目：

```powershell
# Todo 项目
cd "../02. Todo"
Copy-Item "..\01. Counter\setup-js-project.ps1" .
.\setup-js-project.ps1 -ProjectName "Todo App"
npm run dev

# Meals API 项目
cd "../03. Meals API Project"
# 重复上述步骤
```

---

### 优化配置脚本

如果你发现某些步骤重复，可以：
1. 修改 `setup-js-project.ps1` 适应你的需求
2. 添加额外的依赖自动安装
3. 创建自己的配置模板

---

### 记录学习笔记

创建笔记记录配置过程：

```markdown
# 新建：my-notes/projects/counter-setup.md

## 配置 Counter 项目

### 遇到的问题
- ...

### 解决方案
- ...

### 学到的知识
- ...
```

---

## 📚 相关资源

- **完整配置指南：** `my-notes/PROJECT-SETUP-GUIDE.md`
- **自动配置脚本：** `setup-js-project.ps1`
- **Vite 官方文档：** https://vitejs.dev/

---

**准备好配置你的第一个项目了吗？** 🚀

选择一种方法开始：
- ⚡ **快速配置** → 使用 `setup-js-project.ps1`
- 📝 **手动配置** → 按照步骤 1-9 执行

---

**最后更新：** 2025-10-21

