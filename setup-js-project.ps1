# React JavaScript 项目快速配置脚本
# 用法: .\setup-js-project.ps1

param(
    [string]$ProjectName = "React App"
)

Write-Host "🚀 开始配置 React JavaScript 项目..." -ForegroundColor Cyan
Write-Host "📁 项目名称: $ProjectName" -ForegroundColor Yellow
Write-Host ""

# 1. 初始化 package.json
Write-Host "📦 步骤 1/8: 初始化 package.json..." -ForegroundColor Yellow
npm init -y

# 2. 安装依赖
Write-Host "📦 步骤 2/8: 安装 React 依赖（这可能需要几分钟）..." -ForegroundColor Yellow
npm install react react-dom

Write-Host "📦 步骤 3/8: 安装开发依赖..." -ForegroundColor Yellow
npm install -D vite @vitejs/plugin-react

# 3. 创建 vite.config.js
Write-Host "📝 步骤 4/8: 创建 vite.config.js..." -ForegroundColor Yellow
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
Write-Host "📝 步骤 5/8: 创建 index.html..." -ForegroundColor Yellow
@"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$ProjectName</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@ | Out-File -FilePath "index.html" -Encoding utf8

# 5. 创建 src 目录
Write-Host "📁 步骤 6/8: 创建 src 目录..." -ForegroundColor Yellow
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Force -Path "src" | Out-Null
}

# 6. 创建 main.jsx
Write-Host "📝 步骤 7/8: 创建 src/main.jsx..." -ForegroundColor Yellow
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
Write-Host "📦 步骤 8/8: 移动源码到 src/..." -ForegroundColor Yellow

# 移动 .jsx 文件
Get-ChildItem -Filter "*.jsx" -File | Where-Object { 
    $_.Name -ne "main.jsx" -and $_.DirectoryName -notlike "*\src*" 
} | ForEach-Object {
    Write-Host "  移动: $($_.Name)" -ForegroundColor Gray
    Move-Item $_.FullName -Destination "src/" -Force
}

# 移动 .css 文件
Get-ChildItem -Filter "*.css" -File | Where-Object { 
    $_.DirectoryName -notlike "*\src*" 
} | ForEach-Object {
    Write-Host "  移动: $($_.Name)" -ForegroundColor Gray
    Move-Item $_.FullName -Destination "src/" -Force
}

# 8. 更新 package.json scripts
Write-Host "📝 更新 package.json scripts..." -ForegroundColor Yellow
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

# 更新 scripts
$packageJson.scripts = [PSCustomObject]@{
    "dev" = "vite"
    "build" = "vite build"
    "preview" = "vite preview"
}

# 保存
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath -Encoding UTF8

Write-Host ""
Write-Host "✅ 配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 下一步：" -ForegroundColor Cyan
Write-Host "   运行命令: " -NoNewline -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📂 项目结构：" -ForegroundColor Cyan
Write-Host "   ├── src/" -ForegroundColor Gray
Write-Host "   │   ├── App.jsx" -ForegroundColor Gray
Write-Host "   │   ├── main.jsx" -ForegroundColor Gray
Write-Host "   │   └── *.css" -ForegroundColor Gray
Write-Host "   ├── index.html" -ForegroundColor Gray
Write-Host "   ├── vite.config.js" -ForegroundColor Gray
Write-Host "   └── package.json" -ForegroundColor Gray
Write-Host ""

