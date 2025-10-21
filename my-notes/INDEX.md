# 📚 React 学习笔记导航

> 这是我的 React 学习笔记索引，方便快速查找知识点

**学习开始日期：** 2025-10-21  
**学习方式：** Codebase 驱动 + 实战改进

---

## 📖 核心概念笔记

### React 基础
- [Hooks 完整指南](concepts/hooks.md) - useState, useEffect, useReducer...
- [状态管理对比](concepts/state-management.md) - Context, Zustand, Redux
- [TypeScript + React](concepts/typescript-react.md) - 类型定义、泛型、常见模式

### 设计模式
- [React 设计模式](concepts/patterns.md) - HOC, Render Props, Compound Components...

---

## 🎯 项目分析

### 已完成
- [Counter 项目分析](projects/counter-analysis.md) - useState 基础
- [Zustand Notes App](projects/zustand-notes-app.md) - 状态管理实战
- [Redux 电商项目](projects/redux-ecommerce.md) - 企业级状态管理

### 进行中
- [ ] TanStack Query 项目

---

## 🐛 问题解决记录

### 最近问题
- [2025-10-21 - useState 类型错误](debugging/2025-10-21-typescript-error.md)
- [常见错误速查手册](debugging/common-errors.md)

---

## 💻 代码片段库

- [自定义 Hooks 集合](snippets/custom-hooks.ts)
- [常用模式代码](snippets/useful-patterns.tsx)
- [配置文件模板](snippets/config-templates.js)

---

## 📊 学习资源

### 快速查询
- [快速参考手册](quick-reference.md) - 命令、语法速查
- [学习进度追踪](progress.md) - 每日记录、里程碑

### 实验项目
- [我的改进项目](../my-experiments/) - 基于课程的改进和创新

---

## ⚙️ 环境配置

**重要：** 大部分项目没有配置文件，需要自己搭建运行环境！

- [环境配置完整指南](SETUP-ENVIRONMENT.md) - 三种运行方式详解
- [一键创建模板](../CREATE-TEMPLATE.md) - 快速创建可复用模板
- [配置文件模板](snippets/config-templates.js) - 各种配置文件模板

**推荐方案：**
1. 快速学习 → 使用 CodeSandbox 在线工具
2. 本地开发 → 创建通用模板，复制使用

---

## 🔍 按主题查找

| 主题 | 相关笔记 |
|------|---------|
| **环境配置** | `SETUP-ENVIRONMENT.md`, `../CREATE-TEMPLATE.md` |
| **状态管理** | `concepts/hooks.md`, `concepts/state-management.md` |
| **TypeScript** | `concepts/typescript-react.md`, `debugging/*typescript*` |
| **性能优化** | `concepts/patterns.md#性能优化` |
| **测试** | `projects/*-testing.md` |

---

## 🎓 学习流程

**重要：** 如果你选择手动配置项目，想深入理解每个细节：

- [完整学习流程指南](LEARNING-WORKFLOW.md) - **必读！**
  - 8 步完整学习流程
  - 每一步的详细操作指南
  - 实验验证方法
  - 时间分配建议
  - 每日检查清单

**推荐工作流：**
```
配置环境 → 阅读代码 → 实验验证 → 功能改进 
   ↓
记录笔记 → Git 提交 → 复盘总结 → 开始下一个
```

---

## 📝 笔记模板

需要记录新内容时，使用以下模板：
- 概念学习 → 复制 `concepts/hooks.md` 的结构
- 项目分析 → 复制 `projects/counter-analysis.md` 的结构
- Bug 记录 → 使用 VS Code snippet: `debug`

---

**最后更新：** 2025-10-21

