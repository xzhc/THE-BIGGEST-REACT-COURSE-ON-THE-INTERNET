# React TypeScript 项目快速配置脚本
# 用法: .\setup-ts-project.ps1

param(
    [string]$ProjectName = "React App"
)

Write-Host "🚀 开始配置 React TypeScript 项目..." -ForegroundColor Cyan
Write-Host "📁 项目名称: $ProjectName" -ForegroundColor Yellow
Write-Host ""

# 1. 初始化
Write-Host "📦 步骤 1/10: 初始化 package.json..." -ForegroundColor Yellow
npm init -y

# 2. 安装依赖
Write-Host "📦 步骤 2/10: 安装 React 依赖..." -ForegroundColor Yellow
npm install react react-dom

Write-Host "📦 步骤 3/10: 安装开发依赖..." -ForegroundColor Yellow
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# 3. 创建 vite.config.ts
Write-Host "📝 步骤 4/10: 创建 vite.config.ts..." -ForegroundColor Yellow
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
Write-Host "📝 步骤 5/10: 创建 tsconfig.json..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "tsconfig.json" -Encoding utf8

# 5. 创建 tsconfig.node.json
Write-Host "📝 步骤 6/10: 创建 tsconfig.node.json..." -ForegroundColor Yellow
@"
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
"@ | Out-File -FilePath "tsconfig.node.json" -Encoding utf8

# 6. 创建 index.html
Write-Host "📝 步骤 7/10: 创建 index.html..." -ForegroundColor Yellow
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
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@ | Out-File -FilePath "index.html" -Encoding utf8

# 7. 创建 src 目录
Write-Host "📁 步骤 8/10: 创建 src 目录..." -ForegroundColor Yellow
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Force -Path "src" | Out-Null
}

# 8. 创建 main.tsx
Write-Host "📝 步骤 9/10: 创建 src/main.tsx..." -ForegroundColor Yellow
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
Write-Host "📦 步骤 10/10: 移动源码到 src/..." -ForegroundColor Yellow

# 移动 .tsx 文件
Get-ChildItem -Filter "*.tsx" -File | Where-Object { 
    $_.Name -ne "main.tsx" -and $_.DirectoryName -notlike "*\src*" 
} | ForEach-Object {
    Write-Host "  移动: $($_.Name)" -ForegroundColor Gray
    Move-Item $_.FullName -Destination "src/" -Force
}

# 移动 .ts 文件（排除配置文件）
Get-ChildItem -Filter "*.ts" -File | Where-Object { 
    $_.Name -notlike "*.config.ts" -and 
    $_.Name -notlike "tsconfig*" -and 
    $_.DirectoryName -notlike "*\src*" 
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

# 10. 更新 package.json
Write-Host "📝 更新 package.json scripts..." -ForegroundColor Yellow
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

$packageJson.scripts = [PSCustomObject]@{
    "dev" = "vite"
    "build" = "tsc && vite build"
    "preview" = "vite preview"
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath -Encoding UTF8

Write-Host ""
Write-Host "✅ TypeScript 项目配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 下一步：" -ForegroundColor Cyan
Write-Host "   运行命令: " -NoNewline -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📂 项目结构：" -ForegroundColor Cyan
Write-Host "   ├── src/" -ForegroundColor Gray
Write-Host "   │   ├── App.tsx" -ForegroundColor Gray
Write-Host "   │   ├── main.tsx" -ForegroundColor Gray
Write-Host "   │   └── *.css" -ForegroundColor Gray
Write-Host "   ├── index.html" -ForegroundColor Gray
Write-Host "   ├── vite.config.ts" -ForegroundColor Gray
Write-Host "   ├── tsconfig.json" -ForegroundColor Gray
Write-Host "   └── package.json" -ForegroundColor Gray
Write-Host ""

