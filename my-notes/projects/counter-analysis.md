# Counter 项目分析（示例）

**项目路径：** `03. Beginners Projects/01. Counter`  
**学习日期：** 2025-10-21  
**运行命令：** `npm install && npm run dev`  
**访问地址：** http://localhost:5173

---

## 🎯 项目核心功能

- ✅ 点击按钮增加/减少计数
- ✅ 显示当前计数值
- ✅ 重置计数器

**项目亮点：**
- React 最基础的入门项目
- 展示 useState 的基本用法
- 简单的事件处理

---

## 🏗️ 架构设计

### 文件结构
```
01. Counter/
├── App.jsx          # 主组件
├── style.css        # 样式文件
└── package.json     # 依赖配置
```

### 技术栈
- **框架：** React
- **状态管理：** useState Hook
- **样式：** 原生 CSS

---

## 🎨 核心代码分析

### 1. 状态管理

**为什么用 useState？**
- 需要一个响应式的计数值
- 值变化时自动更新 UI

**核心代码：**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**设计亮点：**
- ✅ 简洁明了的 API
- ✅ 声明式编程（描述"是什么"而非"怎么做"）

---

## 💡 学到的关键点

### 1. useState 的工作原理

**理解：**
- `count` 是**只读**的，不能直接修改
- 必须通过 `setCount` 更新
- 每次更新会触发组件重新渲染

**实验：**
```jsx
// ❌ 错误：直接修改不会触发渲染
count = count + 1; // 无效

// ✅ 正确：使用 setState
setCount(count + 1);
```

### 2. 事件处理

**两种写法：**
```jsx
// 方式 1：直接传递函数引用
<button onClick={increment}>+</button>

// 方式 2：箭头函数包裹
<button onClick={() => increment()}>+</button>

// ⚠️ 错误：立即执行函数
<button onClick={increment()}>+</button> // 错误！会在渲染时执行
```

---

## 🔧 我的改进

### 改进 1：添加步长控制

**改进思路：**
- 允许用户自定义每次增减的数值
- 使用额外的 state 存储步长

**实现代码：**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  
  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      
      <div>
        <label>Step: </label>
        <input 
          type="number" 
          value={step} 
          onChange={(e) => setStep(Number(e.target.value))}
        />
      </div>
      
      <button onClick={increment}>+ {step}</button>
      <button onClick={decrement}>- {step}</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**效果对比：**
- 改进前：固定 +1/-1
- 改进后：可自定义步长

**提交记录：** `git commit -m "feat: Counter 添加步长控制"`

---

### 改进 2：添加历史记录

**改进思路：**
- 记录每次操作的历史
- 支持撤销功能

**实现代码：**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([0]);
  
  const updateCount = (newCount) => {
    setCount(newCount);
    setHistory([...history, newCount]);
  };
  
  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCount(newHistory[newHistory.length - 1]);
    }
  };
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => updateCount(count + 1)}>+</button>
      <button onClick={() => updateCount(count - 1)}>-</button>
      <button onClick={undo} disabled={history.length <= 1}>
        Undo
      </button>
      
      <div>
        <h3>History:</h3>
        <p>{history.join(' → ')}</p>
      </div>
    </div>
  );
}
```

**学到的模式：**
- 使用数组存储历史状态
- 不可变更新数组（`[...history, newCount]`）

---

## 🐛 遇到的问题

### 问题 1：连续点击只增加一次

**现象：** 快速点击按钮，计数只增加一次  
**原因：** 在 setTimeout 等异步场景中，闭包捕获的是旧的 count 值  
**解决：** 使用函数式更新

```jsx
// ❌ 错误
setTimeout(() => setCount(count + 1), 1000);

// ✅ 正确
setTimeout(() => setCount(prev => prev + 1), 1000);
```

---

## 🎓 收获总结

### 技术收获
1. 掌握了 useState 的基本用法
2. 理解了 React 的声明式编程思想
3. 学会了事件处理的正确方式

### 可复用的代码/模式
```jsx
// 通用计数器 Hook
function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// 使用
const { count, increment, decrement, reset } = useCounter(0, 2);
```

**保存位置：** `my-notes/snippets/custom-hooks.ts`

### 下一步学习
- [x] 理解 useState 基础
- [ ] 学习 useEffect（副作用处理）
- [ ] 学习多个状态的管理（useReducer）

---

## 🔗 相关资源

### 项目内相关
- 概念笔记：`concepts/hooks.md#useState`
- 下一个项目：`projects/todo-analysis.md`

### 外部资源
- [React 官方文档 - useState](https://react.dev/reference/react/useState)

---

## 📝 快速回顾

**一句话总结：** Counter 项目是学习 React 状态管理的最佳入门案例。

**核心代码片段：**
```jsx
const [count, setCount] = useState(0);
setCount(count + 1); // 更新状态触发重渲染
```

**推荐指数：** ⭐⭐⭐⭐⭐ (5/5)  
**难度评级：** 简单

---

**最后更新：** 2025-10-21

