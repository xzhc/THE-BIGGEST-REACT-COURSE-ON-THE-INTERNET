# 🚀 一键创建 React 项目模板

> 为没有配置文件的项目创建可复用的运行环境模板

---

## 🎯 目标

创建两个通用模板，以后可以快速复制使用：
1. `_template-react-js` - JavaScript 版本
2. `_template-react-ts` - TypeScript 版本

---

## ⚡ 快速创建（复制执行）

### 方法一：使用 PowerShell（Windows）

```powershell
# 进入项目根目录
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"

# ===== 创建 JavaScript 模板 =====
Write-Host "创建 JavaScript 模板..." -ForegroundColor Green
npm create vite@latest _template-react-js -- --template react
cd _template-react-js
npm install
Write-Host "✅ JavaScript 模板创建完成！" -ForegroundColor Green
cd ..

# ===== 创建 TypeScript 模板 =====
Write-Host "创建 TypeScript 模板..." -ForegroundColor Yellow
npm create vite@latest _template-react-ts -- --template react-ts
cd _template-react-ts
npm install
Write-Host "✅ TypeScript 模板创建完成！" -ForegroundColor Green
cd ..

Write-Host "🎉 所有模板创建完成！" -ForegroundColor Cyan
```

### 方法二：使用 CMD（Windows）

```cmd
cd F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET

:: JavaScript 模板
npm create vite@latest _template-react-js -- --template react
cd _template-react-js
npm install
cd ..

:: TypeScript 模板
npm create vite@latest _template-react-ts -- --template react-ts
cd _template-react-ts
npm install
cd ..

echo All templates created!
```

---

## 📋 模板创建后的文件结构

### JavaScript 模板 (`_template-react-js/`)
```
_template-react-js/
├── node_modules/        # 已安装依赖
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

### TypeScript 模板 (`_template-react-ts/`)
```
_template-react-ts/
├── node_modules/        # 已安装依赖
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

---

## 🎮 使用模板示例

### 示例 1：运行 Counter 项目（JavaScript）

```powershell
# 1. 复制模板
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
Copy-Item -Recurse "_template-react-js" "my-experiments\counter-app"

# 2. 清空并复制源码
cd "my-experiments\counter-app"
Remove-Item src\App.jsx, src\App.css, src\index.css

Copy-Item "../../03. Beginners Projects/01. Counter/App.jsx" src/
Copy-Item "../../03. Beginners Projects/01. Counter/Counter.jsx" src/
Copy-Item "../../03. Beginners Projects/01. Counter/style.css" src/

# 3. 运行（依赖已经安装好，直接运行）
npm run dev
```

---

### 示例 2：运行 Zustand Notes App（TypeScript）

```powershell
# 1. 复制 TypeScript 模板
cd "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
Copy-Item -Recurse "_template-react-ts" "my-experiments\zustand-notes"

# 2. 复制源码
cd "my-experiments\zustand-notes"
Remove-Item src\* -Recurse

Copy-Item -Recurse "../../10. Zustand With 10 Projects/2. Projects/1. Notes App/*" src/

# 3. 安装 Zustand
npm install zustand

# 4. 运行
npm run dev
```

---

## 🔧 添加常用依赖到模板（可选）

如果你想模板默认包含常用库：

### 增强版 JavaScript 模板

```bash
cd _template-react-js

# 状态管理
npm install zustand @reduxjs/toolkit react-redux

# 数据请求
npm install @tanstack/react-query axios

# 动画
npm install framer-motion

# 工具
npm install clsx

cd ..
```

### 增强版 TypeScript 模板

```bash
cd _template-react-ts

# 同上
npm install zustand @reduxjs/toolkit react-redux
npm install @tanstack/react-query axios
npm install framer-motion
npm install clsx

cd ..
```

**⚠️ 注意：** 这会让模板变大，但以后不用每次安装依赖。

---

## 📝 快速使用脚本（可选）

创建一个 PowerShell 脚本快速启动项目：

### 创建 `start-project.ps1`

```powershell
# 保存为：start-project.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,
    
    [string]$Type = "js"  # js 或 ts
)

$RootPath = "F:\Tech\SoftwareEnginner\FullStack\frontend\THE-BIGGEST-REACT-COURSE-ON-THE-INTERNET"
$Template = if ($Type -eq "ts") { "_template-react-ts" } else { "_template-react-js" }
$DestPath = "$RootPath\my-experiments\$ProjectName"

Write-Host "📦 创建项目：$ProjectName" -ForegroundColor Cyan

# 复制模板
Copy-Item -Recurse "$RootPath\$Template" $DestPath

# 复制源码
Write-Host "📂 复制源码..." -ForegroundColor Yellow
Copy-Item -Recurse "$RootPath\$SourcePath\*" "$DestPath\src\"

# 进入目录
Set-Location $DestPath

Write-Host "✅ 项目创建完成！" -ForegroundColor Green
Write-Host "💡 运行：npm run dev" -ForegroundColor Cyan
```

### 使用脚本

```powershell
# 运行 Counter 项目
.\start-project.ps1 -ProjectName "counter-app" -SourcePath "03. Beginners Projects\01. Counter"

# 运行 Zustand Notes
.\start-project.ps1 -ProjectName "notes-app" -SourcePath "10. Zustand With 10 Projects\2. Projects\1. Notes App" -Type "ts"
```

---

## 🎯 推荐工作流

### 日常学习流程

```
1. 确保模板已创建（只需一次）

2. 学习新项目时：
   复制模板 → 粘贴源码 → npm run dev

3. 理解代码后：
   修改和改进 → 记录笔记 → 提交 Git

4. 项目完成：
   保留在 my-experiments/ 或删除
```

---

## ⚠️ 注意事项

### 模板不要提交到 Git

在 `.gitignore` 中添加：
```
_template-react-js/
_template-react-ts/
```

**原因：** 模板包含 `node_modules/`，体积很大

### 定期更新模板

每隔一段时间重新创建模板，获取最新版本的依赖：
```bash
rm -rf _template-react-js _template-react-ts
# 重新执行创建命令
```

---

## 🆚 模板 vs 在线工具

### 使用本地模板的情况
- ✅ 需要深度修改代码
- ✅ 想提交到 Git
- ✅ 需要调试工具
- ✅ 离线环境

### 使用在线工具的情况
- ✅ 只想快速查看效果
- ✅ 不想占用本地空间
- ✅ 需要在线分享
- ✅ 临时测试想法

**建议：** 两者结合使用

---

## 📚 相关文档

- **详细说明：** `my-notes/SETUP-ENVIRONMENT.md`
- **使用指南：** `HOW-TO-USE-NOTES.md`
- **快速启动：** `QUICK-START.md`

---

## ✅ 检查模板是否创建成功

```powershell
# 测试 JavaScript 模板
cd _template-react-js
npm run dev
# 浏览器打开 http://localhost:5173，看到 Vite + React 页面

# 测试 TypeScript 模板
cd _template-react-ts
npm run dev
# 同上
```

---

**准备好创建模板了吗？** 复制上面的命令开始吧！ 🚀

---

**最后更新：** 2025-10-21

