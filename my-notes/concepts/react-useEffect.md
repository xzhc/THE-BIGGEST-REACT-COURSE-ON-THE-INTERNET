# React useEffect：副作用管理完全指南

> **学习日期：** 2025-10-25  
> **主题：** useEffect 的本质、执行时机、依赖数组与清理函数  
> **来源：** React Hooks 实战与深度理解

---

## 📚 目录

1. [为什么需要 useEffect？](#1-为什么需要-useeffect)
2. [问题引入](#2-问题引入)
3. [useEffect 的三种执行模式](#3-useeffect-的三种执行模式)
4. [依赖数组的工作原理](#4-依赖数组的工作原理)
5. [清理函数（Cleanup）](#5-清理函数cleanup)
6. [常见副作用场景](#6-常见副作用场景)
7. [数据请求最佳实践](#7-数据请求最佳实践)
8. [执行时机与生命周期](#8-执行时机与生命周期)
9. [常见错误与陷阱](#9-常见错误与陷阱)
10. [useEffect vs 其他方案](#10-useeffect-vs-其他方案)
11. [最佳实践](#11-最佳实践)
12. [进阶话题](#12-进阶话题)

---

## 1. 为什么需要 useEffect？

> **核心问题：** React 为什么要发明 `useEffect`？它解决了什么问题？如果不用它会遇到什么困难？

---

### useEffect 解决的核心问题

在理解"如何使用 useEffect"之前，先要理解"为什么需要 useEffect"。它是 React 处理**副作用（Side Effects）**的标准方式。

#### 什么是副作用？

**纯函数**：给定相同输入，总是返回相同输出，且不产生任何外部影响。

```javascript
// ✅ 纯函数
function add(a, b) {
  return a + b;  // 只计算，不改变外部状态
}

// ✅ 纯组件渲染
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;  // 只返回 JSX，无副作用
}
```

**副作用**：任何与"计算返回值"无关的操作，会影响外部世界的行为。

```javascript
// ❌ 副作用示例
console.log('something');           // 输出到控制台
document.title = 'New Title';       // 修改 DOM
fetch('/api/data');                 // 网络请求
localStorage.setItem('key', 'val'); // 修改浏览器存储
setTimeout(() => {}, 1000);         // 定时器
window.addEventListener('resize');  // 事件监听
```

**React 组件应该是纯函数**：
- 渲染阶段只能计算 JSX，不能执行副作用
- 副作用必须在"安全的时机"执行，这就是 `useEffect` 的职责

---

#### 1. 渲染纯度：隔离副作用

**问题：** 在渲染期间直接执行副作用会导致不可预测的行为

```jsx
// ❌ 错误：在渲染中直接执行副作用
function BadComponent() {
  const [count, setCount] = useState(0);
  
  // 💥 严重错误：在渲染中直接执行副作用
  document.title = `Count: ${count}`;  // 每次渲染都执行
  
  // 💥 更严重：在渲染中触发状态更新
  setCount(count + 1);  // 无限循环！
  
  return <div>{count}</div>;
}
```

**为什么不行？**
- React 的协调（Reconciliation）可能会多次调用组件（Strict Mode、并发渲染）
- 副作用会重复执行，导致性能问题或错误
- 可能造成无限循环（副作用触发状态更新 → 触发重渲染 → 再次执行副作用）

**useEffect 如何解决？**

```jsx
// ✅ 正确：副作用放到 useEffect 中
function GoodComponent() {
  const [count, setCount] = useState(0);
  
  // ✅ useEffect 在渲染完成后执行
  useEffect(() => {
    document.title = `Count: ${count}`;  // 在 DOM 更新后执行
  }, [count]);
  
  return <div>{count}</div>;
}
```

**原理：**
- 渲染阶段：React 只执行组件函数，计算 JSX
- 提交阶段：React 更新真实 DOM
- Effect 阶段：React 执行 `useEffect` 中的副作用

```
渲染 → 提交到 DOM → 执行 useEffect
 ↑_____________________________|
        (如果依赖变化)
```

---

#### 2. 同步外部系统

**问题：** 组件需要与 React 之外的系统保持同步

```jsx
// ❌ 问题：组件状态与外部系统不同步
function ChatRoom({ roomId }) {
  // 如何确保：
  // - 组件挂载时，连接到聊天室？
  // - roomId 改变时，断开旧连接，建立新连接？
  // - 组件卸载时，断开连接？
  
  return <div>Chat Room: {roomId}</div>;
}
```

**useEffect 如何解决？**

```jsx
// ✅ 正确：useEffect 同步外部系统
function ChatRoom({ roomId }) {
  useEffect(() => {
    // 建立连接（同步到外部系统）
    const connection = createConnection(roomId);
    connection.connect();
    
    // 清理函数（断开连接）
    return () => {
      connection.disconnect();
    };
  }, [roomId]);  // roomId 变化时，重新同步
  
  return <div>Chat Room: {roomId}</div>;
}
```

**useEffect 是"同步"的桥梁：**
- **挂载时**：执行 effect，同步到外部系统
- **依赖变化**：先清理旧的，再执行新的，重新同步
- **卸载时**：执行清理函数，解除同步

---

#### 3. 生命周期的统一抽象

**类组件时代的痛点：**

```jsx
// ❌ 类组件：逻辑分散在多个生命周期
class WindowSize extends React.Component {
  state = { width: window.innerWidth };
  
  // 挂载时：添加监听器
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
  
  // 更新时：可能需要处理 props 变化
  componentDidUpdate(prevProps) {
    if (prevProps.trackResize !== this.props.trackResize) {
      if (this.props.trackResize) {
        window.addEventListener('resize', this.handleResize);
      } else {
        window.removeEventListener('resize', this.handleResize);
      }
    }
  }
  
  // 卸载时：移除监听器
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  
  handleResize = () => {
    this.setState({ width: window.innerWidth });
  };
  
  render() {
    return <div>Width: {this.state.width}</div>;
  }
}
```

**问题：**
- 相关逻辑分散在 3 个生命周期方法
- 清理逻辑与设置逻辑分离，容易遗漏
- 不同关注点的代码混在一起

**useEffect 如何解决？**

```jsx
// ✅ useEffect：相关逻辑聚合在一起
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    // 设置逻辑
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // 清理逻辑（紧邻设置逻辑）
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);  // 空数组 = 只在挂载/卸载时执行
  
  return <div>Width: {width}</div>;
}
```

**优势：**
- 设置与清理代码在一起，不易遗漏
- 一个 effect 聚合一个关注点
- 多个 effect 可以分离不同关注点

```jsx
function Profile({ userId }) {
  // Effect 1：用户数据
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  // Effect 2：在线状态
  useEffect(() => {
    const subscription = subscribeToStatus(userId);
    return () => subscription.unsubscribe();
  }, [userId]);
  
  // Effect 3：页面标题
  useEffect(() => {
    document.title = `${user?.name || 'User'} Profile`;
  }, [user?.name]);
}
```

---

#### 4. 时机控制：在 DOM 更新后执行

**问题：** 某些操作必须在 DOM 更新后才能执行

```jsx
// ❌ 问题：DOM 还没更新
function Highlighter() {
  const [text, setText] = useState('');
  
  // 渲染期间，DOM 还没更新
  const element = document.getElementById('text');
  if (element) {
    element.style.backgroundColor = 'yellow';  // 可能失败或作用于旧 DOM
  }
  
  return <div id="text">{text}</div>;
}
```

**useEffect 如何解决？**

```jsx
// ✅ 正确：在 DOM 更新后执行
function Highlighter() {
  const [text, setText] = useState('');
  
  useEffect(() => {
    // 此时 DOM 已更新
    const element = document.getElementById('text');
    if (element) {
      element.style.backgroundColor = 'yellow';  // 安全
    }
  }, [text]);
  
  return <div id="text">{text}</div>;
}
```

**执行顺序：**
1. 组件渲染（计算 JSX）
2. React 更新真实 DOM
3. 浏览器绘制屏幕
4. **useEffect 执行**（此时 DOM 已可见）

---

#### 5. 依赖追踪：响应式更新

**问题：** 手动管理"哪些变化需要触发哪些操作"很复杂

```jsx
// ❌ 问题：手动管理依赖关系
class ProductPage extends React.Component {
  componentDidMount() {
    this.fetchProduct(this.props.productId);
  }
  
  componentDidUpdate(prevProps) {
    // 手动检查每个可能影响的 prop
    if (prevProps.productId !== this.props.productId) {
      this.fetchProduct(this.props.productId);
    }
    
    // 如果还依赖其他 props，继续添加 if
    if (prevProps.category !== this.props.category) {
      // ...
    }
  }
  
  fetchProduct(id) { /* ... */ }
}
```

**useEffect 如何解决？**

```jsx
// ✅ 正确：依赖数组自动追踪
function ProductPage({ productId, category }) {
  useEffect(() => {
    fetchProduct(productId, category);
  }, [productId, category]);  // 任一变化都会重新执行
  
  // ESLint 插件会自动提示依赖项
}
```

**原理：**
- React 对比依赖数组中每个值的"引用"
- 任一值变化（`Object.is` 判断），就重新执行 effect
- 配合 ESLint 插件，自动检查依赖完整性

---

### 如果不用 useEffect 会怎样？

#### 方案 1：直接在渲染中执行副作用

```jsx
// ❌ 严重错误
function BadTimer() {
  const [count, setCount] = useState(0);
  
  // 💥 每次渲染都创建新定时器，永不清理
  setTimeout(() => {
    setCount(count + 1);
  }, 1000);
  
  return <div>{count}</div>;
}
// 结果：定时器堆积，内存泄漏，性能崩溃
```

**问题：**
- ❌ 每次渲染创建新副作用，不会清理
- ❌ Strict Mode 或并发渲染会多次执行
- ❌ 无法在卸载时清理

---

#### 方案 2：使用类组件生命周期

```jsx
// ❌ 类组件：逻辑分散，难以复用
class Timer extends React.Component {
  state = { count: 0 };
  timerId = null;
  
  componentDidMount() {
    this.timerId = setInterval(() => {
      this.setState(prev => ({ count: prev.count + 1 }));
    }, 1000);
  }
  
  componentWillUnmount() {
    clearInterval(this.timerId);
  }
  
  render() {
    return <div>{this.state.count}</div>;
  }
}
```

**问题：**
- ❌ 逻辑分散在多个方法
- ❌ 无法抽取为可复用的逻辑（Custom Hook）
- ❌ this 绑定问题

---

#### 方案 3：事件处理中执行

```jsx
// ❌ 问题：无法在挂载时执行，无法响应 props 变化
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  
  const handleLoad = () => {
    fetchProduct(productId).then(setProduct);
  };
  
  // 必须手动点击才能加载
  return (
    <div>
      <button onClick={handleLoad}>Load Product</button>
      {product && <div>{product.name}</div>}
    </div>
  );
}

// 用户期望：页面打开就加载数据
// 实际：必须点击按钮
// productId 变化时也不会自动重新加载
```

**问题：**
- ❌ 无法在挂载时自动执行
- ❌ 无法响应 props/state 变化
- ❌ 不符合声明式编程范式

---

### useEffect 的本质

**useEffect 不是简单的"生命周期钩子"，而是：**

```
useEffect = 副作用隔离 + 同步外部系统 + 时机控制 + 依赖追踪 + 自动清理
```

**它是 React 的核心抽象之一，连接了：**
- 组件的**渲染**（纯函数）
- 外部的**副作用**（不纯操作）
- 响应式的**依赖追踪**
- 自动的**清理机制**

**没有 useEffect，你需要自己：**
1. 确保副作用不在渲染期间执行
2. 在合适的时机（挂载/更新/卸载）手动调用
3. 追踪所有依赖，决定何时重新执行
4. 记得清理副作用，避免内存泄漏
5. 处理 Strict Mode 和并发渲染的重复调用

**这基本等于重写 React 的副作用管理系统。**

---

### 核心要点

1. **useEffect 解决了"渲染纯度"问题**  
   副作用必须在渲染完成后执行，不能污染渲染过程。

2. **useEffect 是"同步外部系统"的标准方式**  
   组件状态 ↔ 外部系统（API、浏览器 API、第三方库）。

3. **useEffect 统一了生命周期**  
   替代类组件的 `componentDidMount/Update/WillUnmount`，逻辑更聚合。

4. **useEffect 在 DOM 更新后执行**  
   此时可以安全地操作 DOM、测量尺寸、调用浏览器 API。

5. **useEffect 自动追踪依赖**  
   配合 ESLint，确保依赖完整，避免遗漏或过度执行。

> **一句话总结：** `useEffect` 是 React 把"副作用隔离、同步外部系统、时机控制、依赖追踪、自动清理"整合到一起的核心机制。它让组件保持纯函数特性，同时能安全地与外部世界交互。

---

## 2. 问题引入

### 典型场景

在写组件时，你可能会遇到这些需求：

```jsx
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  
  // 🤔 场景 1：希望在每次 count 变化时，更新页面标题
  // 如何实现？
  
  // 🤔 场景 2：希望监听窗口大小变化
  // 如何添加事件监听器？何时移除？
  
  // 🤔 场景 3：希望从 API 获取数据
  // 何时发起请求？如何避免重复请求？
  
  return <div>{count}</div>;
}
```

### 初学者的困惑

- 为什么不能在渲染中直接执行副作用？
- `useEffect` 什么时候执行？
- 依赖数组是什么？为什么需要它？
- 清理函数（cleanup）是什么？何时执行？
- 如何避免无限循环？

---

## 3. useEffect 的三种执行模式

### 模式 1：每次渲染后都执行（无依赖数组）

```jsx
function App() {
  const [count, setCount] = useState(0);
  
  // 没有依赖数组：每次渲染后都执行
  useEffect(() => {
    console.log('Effect 执行了');
    document.title = `Count: ${count}`;
  });  // ⚠️ 注意：没有第二个参数
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

**执行时机：**
- ✅ 组件首次挂载后
- ✅ 每次重新渲染后（任何状态或 props 变化）

**使用场景：**
- 日志记录（调试用）
- 某些需要在每次渲染后都同步的操作

**⚠️ 注意事项：**
- 性能开销大（每次渲染都执行）
- 容易造成不必要的副作用
- 大多数情况下应该使用依赖数组

---

### 模式 2：只在挂载时执行一次（空依赖数组）

```jsx
function App() {
  const [data, setData] = useState([]);
  
  // 空数组：只在挂载时执行，卸载时清理
  useEffect(() => {
    console.log('组件挂载了');
    
    // 获取数据
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(setData);
    
    // 清理函数（可选）
    return () => {
      console.log('组件卸载了');
    };
  }, []);  // ✅ 空数组 = 只执行一次
  
  return <div>{data.length} items</div>;
}
```

**执行时机：**
- ✅ 组件首次挂载后执行 effect
- ✅ 组件卸载时执行清理函数
- ❌ 重新渲染时不执行

**使用场景：**
- 初始数据获取
- 订阅全局事件
- 初始化第三方库
- 设置定时器/间隔器

**等价于类组件：**
```jsx
componentDidMount() {
  // effect 的代码
}

componentWillUnmount() {
  // cleanup 的代码
}
```

---

### 模式 3：依赖变化时执行（有依赖数组）

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 依赖数组：只在 count 变化时执行
  useEffect(() => {
    console.log('count 变化了:', count);
    document.title = `Count: ${count}`;
  }, [count]);  // ✅ 只在 count 变化时执行
  
  // name 变化不会触发这个 effect
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  );
}
```

**执行时机：**
- ✅ 组件首次挂载后
- ✅ 依赖数组中任一值变化后
- ❌ 其他状态变化时不执行

**React 如何判断"变化"？**
```javascript
// React 内部简化逻辑
function hasChanged(prevDeps, nextDeps) {
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return true;  // 只要有一个不同，就认为变化了
    }
  }
  return false;
}

// Object.is 类似于 ===，但处理了 NaN 和 +0/-0
Object.is(NaN, NaN);       // true
Object.is(+0, -0);         // false
Object.is({}, {});         // false（不同的对象引用）
Object.is([1], [1]);       // false（不同的数组引用）
```

---

### 三种模式对比

| 模式           | 写法                          | 首次挂载 | 重新渲染 | 依赖变化        | 卸载时清理 |
| -------------- | ----------------------------- | -------- | -------- | --------------- | ---------- |
| **无依赖数组** | `useEffect(() => {})`         | ✅        | ✅        | ✅               | ✅          |
| **空依赖数组** | `useEffect(() => {}, [])`     | ✅        | ❌        | ❌               | ✅          |
| **有依赖数组** | `useEffect(() => {}, [a, b])` | ✅        | ❌        | ✅ (a 或 b 变化) | ✅          |

---

### 条件执行：逻辑放在 effect 内部

```jsx
// ❌ 错误：不能条件调用 Hook
function App() {
  const [value, setValue] = useState(0);
  
  if (value > 0) {
    useEffect(() => {  // 💥 违反 Hook 规则
      document.title = `Value: ${value}`;
    });
  }
  
  return <div>{value}</div>;
}

// ✅ 正确：条件逻辑放在 effect 内部
function App() {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    if (value > 0) {  // ✅ 条件在内部
      document.title = `Value: ${value}`;
    }
  }, [value]);
  
  return <div>{value}</div>;
}
```

**原因：**
- Hook 的调用顺序必须一致（React 通过调用顺序来识别 Hook）
- 条件、循环、嵌套函数中不能调用 Hook
- 条件逻辑应该放在 Hook 的内部

---

## 4. 依赖数组的工作原理

### 为什么需要依赖数组？

**问题：** 如何知道何时重新执行 effect？

```jsx
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  
  // 🤔 什么时候应该重新获取产品数据？
  // - productId 变化时？
  // - product 变化时？（不需要，product 是结果）
  // - 组件重新渲染时？（可能太频繁）
}
```

**依赖数组的作用：** 告诉 React "effect 依赖哪些值"

```jsx
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetchProduct(productId).then(setProduct);
  }, [productId]);  // ✅ 只在 productId 变化时重新获取
  
  // productId 不变，即使组件重新渲染，也不会重新请求
}
```

---

### 依赖数组的完整性规则

**规则：** effect 中使用的"所有来自组件作用域的值"都应该在依赖数组中。

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  
  // ❌ 错误：遗漏了 step
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + step);  // 使用了 step，但没有列为依赖
    }, 1000);
    
    return () => clearInterval(timer);
  }, [count]);  // ⚠️ ESLint 会警告：缺少依赖 'step'
}
```

**为什么会出问题？**
```jsx
// 初始状态：count = 0, step = 1
// effect 创建时，闭包捕获了 step = 1

// 用户修改 step 为 5
// effect 不会重新执行（因为依赖数组中没有 step）
// 定时器还是用的旧的 step = 1
// 结果：count 每次只加 1，而不是 5
```

**解决方案：**

```jsx
// ✅ 方案 1：完整的依赖数组
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + step);
  }, 1000);
  
  return () => clearInterval(timer);
}, [count, step]);  // ✅ 包含所有依赖

// ✅ 方案 2：使用函数式更新（推荐）
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + step);  // 从闭包中读取 step
  }, 1000);
  
  return () => clearInterval(timer);
}, [step]);  // ✅ 只依赖 step

// ✅ 方案 3：使用 useRef 存储可变值
const stepRef = useRef(step);
useEffect(() => { stepRef.current = step; });  // 同步到 ref

useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + stepRef.current);  // 从 ref 读取最新值
  }, 1000);
  
  return () => clearInterval(timer);
}, []);  // ✅ 空数组
```

---

### 什么应该/不应该作为依赖

#### ✅ 应该作为依赖

```jsx
function Component({ userId, config }) {
  const [data, setData] = useState(null);
  const multiplier = 2;
  
  useEffect(() => {
    // ✅ Props
    fetchUser(userId);
    
    // ✅ State
    console.log(data);
    
    // ✅ 渲染期间计算的值
    const result = data * multiplier;
    
    // ✅ 函数（如果在组件内定义）
    const process = () => { /* ... */ };
    process();
    
    // ✅ 对象/数组（如果在组件内创建）
    const options = { method: 'GET' };
    fetch('/api', options);
  }, [userId, data, multiplier, /* ... */]);
  
  // ⚠️ 上面的依赖数组不完整，只是示例
}
```

#### ❌ 不应该作为依赖

```jsx
function Component() {
  useEffect(() => {
    // ❌ setState 函数（稳定，永远不变）
    setCount(1);  // 不需要把 setCount 加入依赖
    
    // ❌ useRef 的 current 值（不会触发重渲染）
    console.log(ref.current);  // 不需要把 ref.current 加入依赖
    
    // ❌ 外部常量（不会变化）
    console.log(API_URL);  // 如果 API_URL 是模块级常量
    
    // ❌ 浏览器 API（全局对象）
    window.addEventListener('resize', handler);  // window 不是依赖
    
  }, []);  // ✅ 这些都不需要加入依赖
}
```

---

### 对象和数组作为依赖的陷阱

```jsx
// ❌ 问题：每次渲染都创建新对象
function App() {
  const [count, setCount] = useState(0);
  
  const options = { method: 'GET' };  // 每次渲染都是新对象
  
  useEffect(() => {
    fetch('/api', options);
  }, [options]);  // 💥 每次渲染都会重新执行 effect
}

// 为什么？
// 第 1 次渲染：options = { method: 'GET' }  地址: 0x001
// 第 2 次渲染：options = { method: 'GET' }  地址: 0x002
// Object.is(0x001, 0x002) === false
// React 认为 options 变化了，重新执行 effect
```

**解决方案：**

```jsx
// ✅ 方案 1：移到 effect 内部
useEffect(() => {
  const options = { method: 'GET' };  // 每次 effect 执行时创建
  fetch('/api', options);
}, []);  // 不需要依赖 options

// ✅ 方案 2：移到组件外部
const OPTIONS = { method: 'GET' };  // 模块级常量，永不变化

function App() {
  useEffect(() => {
    fetch('/api', OPTIONS);
  }, []);  // OPTIONS 不是依赖
}

// ✅ 方案 3：使用 useMemo 稳定引用
function App() {
  const options = useMemo(() => ({ method: 'GET' }), []);
  
  useEffect(() => {
    fetch('/api', options);
  }, [options]);  // options 引用稳定
}

// ✅ 方案 4：解构依赖
function App({ config }) {
  const { method } = config;  // 解构出原始值
  
  useEffect(() => {
    fetch('/api', { method });
  }, [method]);  // 依赖原始值，而不是对象
}
```

---

### 函数作为依赖的陷阱

```jsx
// ❌ 问题：每次渲染都创建新函数
function App() {
  const [count, setCount] = useState(0);
  
  const fetchData = () => {  // 每次渲染都是新函数
    fetch('/api');
  };
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);  // 💥 每次渲染都会重新执行
}
```

**解决方案：**

```jsx
// ✅ 方案 1：移到 effect 内部
useEffect(() => {
  const fetchData = () => {  // 在 effect 内定义
    fetch('/api');
  };
  fetchData();
}, []);

// ✅ 方案 2：使用 useCallback 稳定引用
function App() {
  const fetchData = useCallback(() => {
    fetch('/api');
  }, []);  // 依赖为空，函数引用永不变
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);  // fetchData 引用稳定
}

// ✅ 方案 3：直接内联
useEffect(() => {
  fetch('/api');  // 直接写，不抽取函数
}, []);
```

---

### ESLint 插件：自动检查依赖

**安装 ESLint 插件：**
```bash
npm install eslint-plugin-react-hooks --save-dev
```

**配置 `.eslintrc.js`：**
```javascript
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",      // 检查 Hook 规则
    "react-hooks/exhaustive-deps": "warn"       // 检查依赖完整性
  }
}
```

**插件会自动提示：**
```jsx
useEffect(() => {
  console.log(count);
}, []);  // ⚠️ Warning: React Hook useEffect has a missing dependency: 'count'
```

---

## 5. 清理函数（Cleanup）

### 为什么需要清理？

**问题：** 副作用可能会产生"持续性影响"，需要在适当时机撤销

```jsx
// ❌ 问题：事件监听器堆积
function WindowSize() {
  const [size, setSize] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // 💥 没有清理：每次重新渲染都添加新监听器
    // 组件卸载后，监听器还在，造成内存泄漏
  });
  
  return <div>{size}</div>;
}

// 场景：
// 1. 组件挂载，添加监听器 1
// 2. 状态变化，组件重新渲染，添加监听器 2（监听器 1 还在）
// 3. 再次渲染，添加监听器 3（监听器 1、2 还在）
// 4. 组件卸载，但监听器 1、2、3 都还在内存中
```

**清理函数如何解决？**

```jsx
// ✅ 正确：清理旧的监听器
function WindowSize() {
  const [size, setSize] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // ✅ 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);  // 空数组：只在挂载时添加，卸载时移除
  
  return <div>{size}</div>;
}
```

---

### 清理函数的执行时机

```jsx
function Component({ id }) {
  useEffect(() => {
    console.log('Effect 执行: id =', id);
    
    return () => {
      console.log('Cleanup 执行: id =', id);
    };
  }, [id]);
}

// 执行顺序：
// 1. 组件挂载，id = 1
//    → "Effect 执行: id = 1"

// 2. id 变为 2，组件重新渲染
//    → "Cleanup 执行: id = 1"  （清理旧的 effect）
//    → "Effect 执行: id = 2"    （执行新的 effect）

// 3. id 变为 3
//    → "Cleanup 执行: id = 2"
//    → "Effect 执行: id = 3"

// 4. 组件卸载
//    → "Cleanup 执行: id = 3"
```

**关键：**
- 清理函数在**下一次 effect 执行前**运行
- 清理函数在**组件卸载时**运行
- 清理函数捕获的是**创建时的闭包**（旧值）

---

### 需要清理的常见副作用

#### 1. 事件监听器

```jsx
// ✅ 清理事件监听器
function Component() {
  useEffect(() => {
    const handleClick = () => console.log('clicked');
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);
}
```

#### 2. 定时器

```jsx
// ✅ 清理定时器
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);  // 清理定时器
    };
  }, []);
}
```

#### 3. 网络请求

```jsx
// ✅ 取消网络请求
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`/api/users/${userId}`, {
      signal: controller.signal  // 关联取消信号
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      controller.abort();  // 取消请求
    };
  }, [userId]);
}
```

#### 4. 订阅

```jsx
// ✅ 取消订阅
function ChatRoom({ roomId }) {
  useEffect(() => {
    const subscription = chatAPI.subscribe(roomId, message => {
      console.log(message);
    });
    
    return () => {
      subscription.unsubscribe();  // 取消订阅
    };
  }, [roomId]);
}
```

#### 5. 动画

```jsx
// ✅ 取消动画帧
function AnimatedComponent() {
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      // 动画逻辑
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);  // 取消动画
    };
  }, []);
}
```

#### 6. 第三方库

```jsx
// ✅ 清理第三方库实例
function MapComponent() {
  useEffect(() => {
    const map = new MapLibrary('#map', options);
    
    return () => {
      map.destroy();  // 销毁地图实例
    };
  }, []);
}
```

---

### 不需要清理的副作用

某些副作用是"一次性"的，不需要清理：

```jsx
// ✅ 不需要返回清理函数
function Component() {
  useEffect(() => {
    // 修改 DOM 属性（幂等操作）
    document.title = 'New Title';
    
    // 发送一次性日志
    analytics.log('page_view');
    
    // 不需要 return () => {}
  }, []);
}
```

---

### 清理函数的最佳实践

#### 1. 清理函数应该撤销 effect 的所有影响

```jsx
// ✅ 完整清理
useEffect(() => {
  const sub1 = api.subscribe('channel1', handler1);
  const sub2 = api.subscribe('channel2', handler2);
  window.addEventListener('resize', handler3);
  
  return () => {
    sub1.unsubscribe();  // 清理订阅 1
    sub2.unsubscribe();  // 清理订阅 2
    window.removeEventListener('resize', handler3);  // 清理监听器
  };
}, []);
```

#### 2. 使用相同的引用

```jsx
// ✅ 正确：添加和移除使用同一个函数引用
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);  // 同一个 handler
  };
}, []);

// ❌ 错误：不同的函数引用
useEffect(() => {
  window.addEventListener('resize', () => console.log('resize'));
  
  return () => {
    window.removeEventListener('resize', () => console.log('resize'));
    // 💥 这是新函数，移除不了原来的监听器
  };
}, []);
```

#### 3. 处理竞态条件

```jsx
// ✅ 使用标志位忽略过期的响应
useEffect(() => {
  let ignore = false;
  
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      if (!ignore) {  // 只有最新的请求才更新状态
        setData(data);
      }
    });
  
  return () => {
    ignore = true;  // 标记为过期
  };
}, []);
```

---

## 6. 常见副作用场景

### 场景 1：修改页面标题

```jsx
function PageTitle({ title }) {
  useEffect(() => {
    // 保存旧标题
    const prevTitle = document.title;
    
    // 设置新标题
    document.title = title;
    
    // 可选：恢复旧标题（取决于需求）
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
  
  return <div>Page Title: {title}</div>;
}
```

---

### 场景 2：监听窗口事件

```jsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);  // 空数组：只在挂载时添加
  
  return <div>{size.width} x {size.height}</div>;
}
```

---

### 场景 3：定时器/间隔器

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (!isRunning) return;  // 未运行时不启动定时器
    
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);  // isRunning 变化时重新执行
  
  return (
    <div>
      <p>{seconds} seconds</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
```

---

### 场景 4：监听键盘事件

```jsx
function KeyLogger() {
  const [key, setKey] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKey(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return <div>Last key pressed: {key}</div>;
}
```

---

### 场景 5：焦点管理

```jsx
function SearchInput({ autoFocus }) {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);  // autoFocus 变化时重新聚焦
  
  return <input ref={inputRef} />;
}
```

---

### 场景 6：localStorage 同步

```jsx
function PersistentCounter() {
  const [count, setCount] = useState(() => {
    // 初始化时从 localStorage 读取
    const saved = localStorage.getItem('count');
    return saved ? JSON.parse(saved) : 0;
  });
  
  useEffect(() => {
    // count 变化时保存到 localStorage
    localStorage.setItem('count', JSON.stringify(count));
  }, [count]);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

---

### 场景 7：滚动到顶部

```jsx
function ScrollToTop({ trigger }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [trigger]);  // trigger 变化时滚动
  
  return null;
}

// 使用
function App() {
  const [page, setPage] = useState(1);
  
  return (
    <>
      <ScrollToTop trigger={page} />
      <button onClick={() => setPage(page + 1)}>Next Page</button>
    </>
  );
}
```

---

## 7. 数据请求最佳实践

### 基础版本：简单数据获取

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**问题：**
- ❌ 没有 loading 状态
- ❌ 没有错误处理
- ❌ 没有取消机制（组件卸载后仍会 setState）
- ❌ 没有处理竞态条件

---

### 改进版本：完整的数据请求

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 1. 取消控制器
    const controller = new AbortController();
    const { signal } = controller;
    
    // 2. 竞态标志
    let ignore = false;
    
    // 3. 异步函数
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/users', { signal });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // 4. 只在最新请求时更新状态
        if (!ignore) {
          setUsers(data);
        }
      } catch (err) {
        // 5. 忽略取消错误
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    
    fetchUsers();
    
    // 6. 清理函数
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

### 带参数的数据请求

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        
        if (!ignore) {
          setUser(data);
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    
    fetchUser();
    
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [userId]);  // ✅ userId 变化时重新请求
  
  // 渲染逻辑...
}
```

**执行流程：**
```
userId = 1 时：
  → 发起请求 1

userId 变为 2 时：
  → 清理函数执行：ignore = true, abort()
  → 请求 1 被取消，即使返回也不会 setState
  → 发起请求 2

组件卸载时：
  → 清理函数执行：ignore = true, abort()
  → 请求 2 被取消
```

---

### 竞态条件详解

**问题场景：**

```jsx
// ❌ 问题：快速切换 userId，后发先至
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);  // 💥 任何响应返回都会更新状态
  }, [userId]);
}

// 场景：
// 1. userId = 1, 发起请求 A
// 2. userId = 2, 发起请求 B
// 3. 请求 B 先返回（网络快），显示用户 2 ✅
// 4. 请求 A 后返回，显示用户 1 ❌ 错误！
// 结果：userId 是 2，但显示的是用户 1
```

**解决方案：ignore 标志**

```jsx
// ✅ 正确：使用 ignore 标志
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let ignore = false;  // 当前请求是否过期
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {  // ✅ 只有最新请求才更新
          setUser(data);
        }
      });
    
    return () => {
      ignore = true;  // 标记为过期
    };
  }, [userId]);
}

// 场景：
// 1. userId = 1, 发起请求 A, ignore_A = false
// 2. userId = 2, 清理函数执行 ignore_A = true, 发起请求 B, ignore_B = false
// 3. 请求 B 返回, ignore_B === false, 显示用户 2 ✅
// 4. 请求 A 返回, ignore_A === true, 被忽略 ✅
// 结果：正确显示用户 2
```

---

### 自定义 Hook：复用数据请求逻辑

```jsx
// ✅ 抽取为自定义 Hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(url, { signal: controller.signal });
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const json = await res.json();
        
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url]);
  
  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return <div>{user.name}</div>;
}
```

---

### 现代推荐：使用 TanStack Query

```jsx
// ✅ 生产推荐：使用 TanStack Query（React Query）
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],  // 缓存键
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
    staleTime: 5000,  // 5 秒内认为数据是新鲜的
  });
  
  // 自动处理：
  // - 缓存
  // - 失效与重新验证
  // - 竞态条件
  // - 重试
  // - Loading/Error 状态
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return <div>{user.name}</div>;
}
```

**为什么推荐 TanStack Query？**
- ✅ 自动缓存与失效管理
- ✅ 内置 loading/error 状态
- ✅ 自动处理竞态条件
- ✅ 重试机制
- ✅ 窗口焦点重新验证
- ✅ 乐观更新
- ✅ 无限滚动/分页
- ✅ DevTools

---

## 8. 执行时机与生命周期

### useEffect 的执行顺序

```jsx
function Parent() {
  console.log('1. Parent render');
  
  useEffect(() => {
    console.log('3. Parent effect');
    return () => console.log('Cleanup: Parent effect');
  });
  
  return <Child />;
}

function Child() {
  console.log('2. Child render');
  
  useEffect(() => {
    console.log('4. Child effect');
    return () => console.log('Cleanup: Child effect');
  });
  
  return <div>Child</div>;
}

// 首次挂载：
// 1. Parent render
// 2. Child render
// 3. Child effect  （子组件的 effect 先执行）
// 4. Parent effect （父组件的 effect 后执行）

// 更新时（父组件触发）：
// 1. Parent render
// 2. Child render
// Cleanup: Child effect  （先清理子组件）
// Cleanup: Parent effect （再清理父组件）
// 3. Child effect        （先执行子组件）
// 4. Parent effect       （再执行父组件）

// 卸载时：
// Cleanup: Child effect
// Cleanup: Parent effect
```

**规律：**
- **渲染顺序**：父 → 子
- **Effect 执行顺序**：子 → 父（从内到外）
- **Cleanup 执行顺序**：子 → 父

---

### useEffect vs useLayoutEffect

| 特性         | useEffect                        | useLayoutEffect                  |
| ------------ | -------------------------------- | -------------------------------- |
| **执行时机** | DOM 更新后，浏览器绘制后（异步） | DOM 更新后，浏览器绘制前（同步） |
| **阻塞渲染** | ❌ 不阻塞                         | ✅ 阻塞                           |
| **用途**     | 大多数副作用（数据请求、订阅）   | DOM 测量、同步 DOM 变化          |
| **性能**     | ✅ 不影响性能                     | ⚠️ 可能造成卡顿                   |

```jsx
// ✅ 使用 useEffect（大多数情况）
function Component() {
  useEffect(() => {
    // 数据请求、订阅、事件监听等
  }, []);
}

// ✅ 使用 useLayoutEffect（需要同步 DOM）
function Tooltip() {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useLayoutEffect(() => {
    // 测量 DOM 尺寸（需要在浏览器绘制前完成，避免闪烁）
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
  }, []);
  
  return <div ref={ref}>Tooltip</div>;
}
```

**时间线：**

```
useEffect:
渲染 → 更新 DOM → 浏览器绘制 → useEffect 执行

useLayoutEffect:
渲染 → 更新 DOM → useLayoutEffect 执行 → 浏览器绘制
                   ↑ 阻塞在这里
```

---

### 与类组件生命周期的对应

```jsx
// 类组件
class Component extends React.Component {
  componentDidMount() {
    // 挂载后执行
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.id !== this.props.id) {
      // id 变化时执行
    }
  }
  
  componentWillUnmount() {
    // 卸载前执行
  }
}

// 函数组件等价
function Component({ id }) {
  // componentDidMount + componentDidUpdate
  useEffect(() => {
    // 每次渲染后执行
  });
  
  // componentDidMount (只执行一次)
  useEffect(() => {
    // 挂载后执行
  }, []);
  
  // componentDidMount + 特定依赖的 componentDidUpdate
  useEffect(() => {
    // 挂载后 + id 变化时执行
  }, [id]);
  
  // componentWillUnmount
  useEffect(() => {
    return () => {
      // 卸载前执行
    };
  }, []);
}
```

---

## 9. 常见错误与陷阱

### 错误 1：在 effect 中触发无限循环

```jsx
// ❌ 错误：无限循环
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1);  // 触发重新渲染
  });  // 没有依赖数组，每次渲染都执行
  
  // 循环：
  // 渲染 → effect 执行 → setCount → 重新渲染 → effect 再次执行 → ...
}

// ✅ 修复：添加依赖数组
useEffect(() => {
  setCount(count + 1);
}, []);  // 只执行一次

// 或者根据具体需求调整逻辑
```

---

### 错误 2：遗漏依赖

```jsx
// ❌ 错误：遗漏依赖
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);  // 使用了 userId
  }, []);  // 💥 依赖数组中没有 userId
  
  // 问题：userId 变化时不会重新获取数据
}

// ✅ 修复：添加完整依赖
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);  // ✅ 包含 userId
```

---

### 错误 3：依赖数组中使用对象/数组

```jsx
// ❌ 错误：每次渲染都创建新对象
function Component() {
  const config = { api: '/data' };  // 每次渲染都是新对象
  
  useEffect(() => {
    fetch(config.api);
  }, [config]);  // 💥 每次渲染都会重新执行
}

// ✅ 修复：依赖原始值
useEffect(() => {
  const config = { api: '/data' };  // 移到 effect 内部
  fetch(config.api);
}, []);

// 或者
const api = '/data';  // 移到组件外部
useEffect(() => {
  fetch(api);
}, [api]);
```

---

### 错误 4：在 effect 中直接使用 async

```jsx
// ❌ 错误：effect 回调不能是 async 函数
useEffect(async () => {  // 💥 类型错误
  const data = await fetch('/api');
}, []);

// 原因：effect 回调必须返回 undefined 或清理函数
// async 函数返回 Promise，不符合要求

// ✅ 修复：在内部定义 async 函数
useEffect(() => {
  async function fetchData() {
    const data = await fetch('/api');
  }
  fetchData();
}, []);

// 或者使用 IIFE
useEffect(() => {
  (async () => {
    const data = await fetch('/api');
  })();
}, []);
```

---

### 错误 5：忘记清理副作用

```jsx
// ❌ 错误：没有清理定时器
useEffect(() => {
  setInterval(() => {
    console.log('tick');
  }, 1000);
  // 💥 组件卸载后定时器还在运行
});

// ✅ 修复：返回清理函数
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return () => {
    clearInterval(timer);  // 清理定时器
  };
}, []);
```

---

### 错误 6：清理函数使用了错误的引用

```jsx
// ❌ 错误：不同的函数引用
useEffect(() => {
  window.addEventListener('resize', () => console.log('resize'));
  
  return () => {
    window.removeEventListener('resize', () => console.log('resize'));
    // 💥 这是新函数，移除不了原来的监听器
  };
}, []);

// ✅ 修复：使用同一个引用
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);  // 同一个 handler
  };
}, []);
```

---

### 错误 7：在条件语句中调用 Hook

```jsx
// ❌ 错误：条件调用 Hook
function Component({ shouldFetch }) {
  if (shouldFetch) {
    useEffect(() => {  // 💥 违反 Hook 规则
      fetch('/api');
    }, []);
  }
}

// ✅ 修复：条件放在 effect 内部
function Component({ shouldFetch }) {
  useEffect(() => {
    if (shouldFetch) {
      fetch('/api');
    }
  }, [shouldFetch]);
}
```

---

### 错误 8：setState 后立即读取状态

```jsx
// ❌ 错误：setState 是异步的
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // 💥 还是旧值（0），不是 1
  };
}

// ✅ 修复：在 effect 中读取
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('count 变化了:', count);  // ✅ 新值
  }, [count]);
  
  const handleClick = () => {
    setCount(count + 1);
  };
}
```

---

## 10. useEffect vs 其他方案

### useEffect vs 事件处理

```jsx
// ❌ 不合适：在 effect 中处理用户交互
function Component() {
  useEffect(() => {
    const handleClick = () => console.log('clicked');
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
}

// ✅ 更好：直接使用事件处理器
function Component() {
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click</button>;
}
```

**规则：**
- 用户交互 → 事件处理器
- 外部事件（窗口、文档） → useEffect

---

### useEffect vs 派生状态

```jsx
// ❌ 不合适：用 effect 同步状态
function Component({ items }) {
  const [filteredItems, setFilteredItems] = useState([]);
  
  useEffect(() => {
    setFilteredItems(items.filter(item => item.active));
  }, [items]);  // items 变化时更新 filteredItems
}

// ✅ 更好：直接计算（派生状态）
function Component({ items }) {
  const filteredItems = items.filter(item => item.active);
  // 不需要 effect，不需要额外状态
}

// ✅ 性能优化：使用 useMemo
function Component({ items }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
}
```

**规则：**
- 能计算出来的，不要存储为状态
- 用 `useMemo` 缓存昂贵计算

---

### useEffect vs useLayoutEffect

```jsx
// ❌ 不合适：用 useEffect 测量 DOM
function Component() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    setHeight(ref.current.offsetHeight);
  }, []);
  
  // 问题：可能看到闪烁（先渲染默认值，再更新为测量值）
}

// ✅ 更好：用 useLayoutEffect 同步测量
function Component() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    setHeight(ref.current.offsetHeight);
  }, []);
  
  // 浏览器绘制前就完成测量，无闪烁
}
```

**规则：**
- 默认用 `useEffect`
- 需要同步 DOM 测量/变化时用 `useLayoutEffect`

---

### useEffect vs Custom Hook

```jsx
// ❌ 不合适：逻辑重复
function Component1() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api').then(res => res.json()).then(setData);
  }, []);
}

function Component2() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api').then(res => res.json()).then(setData);
  }, []);
}

// ✅ 更好：抽取为 Custom Hook
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  return data;
}

function Component1() {
  const data = useFetch('/api');
}

function Component2() {
  const data = useFetch('/api');
}
```

**规则：**
- 可复用的逻辑 → 抽取为 Custom Hook
- 组件特定的逻辑 → 保留在组件内

---

## 11. 最佳实践

### ✅ 推荐做法

#### 1. 每个 effect 只做一件事

```jsx
// ❌ 不好：一个 effect 做多件事
useEffect(() => {
  fetch('/api/user').then(setUser);
  document.title = `User: ${user?.name}`;
  window.addEventListener('resize', handleResize);
}, []);

// ✅ 好：拆分为多个 effect
useEffect(() => {
  fetch('/api/user').then(setUser);
}, []);

useEffect(() => {
  document.title = `User: ${user?.name}`;
}, [user?.name]);

useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

#### 2. 依赖数组完整且最小

```jsx
// ✅ 使用 ESLint 插件自动检查
useEffect(() => {
  console.log(count, name);
}, [count, name]);  // 完整依赖

// ✅ 减少不必要的依赖
useEffect(() => {
  const value = props.multiplier * 2;  // 移到内部
  setResult(count * value);
}, [count, props.multiplier]);  // 只依赖真正需要的
```

---

#### 3. 使用 AbortController 取消请求

```jsx
// ✅ 标准模式
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });
  
  return () => controller.abort();
}, []);
```

---

#### 4. 处理竞态条件

```jsx
// ✅ 使用 ignore 标志
useEffect(() => {
  let ignore = false;
  
  fetch('/api')
    .then(res => res.json())
    .then(data => {
      if (!ignore) setData(data);
    });
  
  return () => { ignore = true; };
}, []);
```

---

#### 5. 命名清理函数

```jsx
// ✅ 清晰的清理函数
useEffect(() => {
  const subscription = api.subscribe();
  
  return function cleanup() {  // 命名清理函数
    subscription.unsubscribe();
  };
}, []);
```

---

#### 6. 抽取为 Custom Hook

```jsx
// ✅ 可复用的逻辑
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// 使用
function Component() {
  const { width, height } = useWindowSize();
}
```

---

### ❌ 避免的做法

#### 1. ❌ 在渲染中执行副作用

```jsx
// ❌ 永远不要这样做
function Component() {
  document.title = 'Title';  // 副作用在渲染中
  fetch('/api');             // 副作用在渲染中
}

// ✅ 放到 useEffect 中
function Component() {
  useEffect(() => {
    document.title = 'Title';
    fetch('/api');
  }, []);
}
```

---

#### 2. ❌ 遗漏清理函数

```jsx
// ❌ 忘记清理
useEffect(() => {
  setInterval(() => console.log('tick'), 1000);
}, []);

// ✅ 记得清理
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer);
}, []);
```

---

#### 3. ❌ 依赖不稳定的引用

```jsx
// ❌ 对象在每次渲染时都是新的
function Component() {
  const config = { url: '/api' };
  
  useEffect(() => {
    fetch(config.url);
  }, [config]);  // 每次都会重新执行
}

// ✅ 依赖原始值
useEffect(() => {
  const config = { url: '/api' };
  fetch(config.url);
}, []);  // 或者依赖 config.url
```

---

#### 4. ❌ 在 effect 中调用 setState 但不设置依赖

```jsx
// ❌ 可能造成无限循环
useEffect(() => {
  setCount(count + 1);
});  // 每次渲染都执行

// ✅ 明确依赖
useEffect(() => {
  if (condition) {
    setCount(count + 1);
  }
}, [condition]);  // 只在 condition 变化时执行
```

---

## 12. 进阶话题

### Strict Mode 下的双重调用

**React 18 Strict Mode：** 开发环境下会故意重复挂载/卸载组件

```jsx
<React.StrictMode>
  <App />
</React.StrictMode>

// 开发环境执行顺序：
// 1. 挂载组件
// 2. 执行 effect
// 3. 执行 cleanup （模拟卸载）
// 4. 重新执行 effect （模拟重新挂载）
```

**目的：** 检测副作用是否正确清理

```jsx
// ✅ 正确的 effect（幂等）
useEffect(() => {
  const subscription = api.subscribe();
  return () => subscription.unsubscribe();
}, []);

// Strict Mode 下：
// subscribe → unsubscribe → subscribe
// 最终状态：有一个活跃订阅 ✅

// ❌ 错误的 effect（不幂等）
useEffect(() => {
  api.subscribe();
  // 没有 cleanup
}, []);

// Strict Mode 下：
// subscribe → subscribe
// 最终状态：两个订阅，内存泄漏 ❌
```

---

### 使用 useEffectEvent（实验性）

**问题：** 某些值不应触发 effect 重新执行，但 effect 内需要读取最新值

```jsx
// ❌ 问题：onMessage 变化会重新连接
function ChatRoom({ roomId, onMessage }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('message', onMessage);  // 使用了 onMessage
    connection.connect();
    
    return () => connection.disconnect();
  }, [roomId, onMessage]);  // 必须包含 onMessage
  
  // 问题：onMessage 每次渲染都是新函数
  // 导致每次都断开重连，不符合预期
}

// ✅ 解决：使用 useEffectEvent（React 实验性 API）
import { useEffectEvent } from 'react';

function ChatRoom({ roomId, onMessage }) {
  const onMessageEvent = useEffectEvent(onMessage);
  
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('message', onMessageEvent);  // 使用 event
    connection.connect();
    
    return () => connection.disconnect();
  }, [roomId]);  // ✅ 不需要依赖 onMessageEvent
  
  // onMessage 变化时，不会重新连接，但能读到最新值
}
```

---

### 服务端渲染（SSR）注意事项

```jsx
// ❌ 问题：SSR 中没有浏览器 API
function Component() {
  useEffect(() => {
    window.addEventListener('resize', handler);  // SSR 中 window 未定义
  }, []);
}

// ✅ 解决：effect 只在客户端执行
function Component() {
  useEffect(() => {
    // useEffect 只在客户端执行，SSR 不会运行
    window.addEventListener('resize', handler);
  }, []);
}

// 但如果需要在服务端也访问某些值：
function Component() {
  const [size, setSize] = useState(() => {
    // ✅ 使用函数初始化，检查 window 是否存在
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0;  // SSR 默认值
  });
  
  useEffect(() => {
    // 客户端激活后才执行
    const handleResize = () => setSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}
```

---

### 性能优化：减少 effect 执行次数

```jsx
// ❌ 问题：频繁执行
function Component({ userId, settings }) {
  useEffect(() => {
    fetchData(userId, settings);
  }, [userId, settings]);  // settings 对象每次都变
}

// ✅ 优化 1：只依赖需要的字段
function Component({ userId, settings }) {
  const { theme, language } = settings;
  
  useEffect(() => {
    fetchData(userId, theme, language);
  }, [userId, theme, language]);  // 原始值更稳定
}

// ✅ 优化 2：使用 useMemo 稳定对象
function Component({ userId, settings }) {
  const stableSettings = useMemo(() => settings, [
    settings.theme,
    settings.language
  ]);
  
  useEffect(() => {
    fetchData(userId, stableSettings);
  }, [userId, stableSettings]);
}
```

---

### 调试技巧

```jsx
// ✅ 打印依赖变化
function Component({ a, b, c }) {
  useEffect(() => {
    console.log('Effect 执行了');
  }, [a, b, c]);
  
  // 找出哪个依赖变化了
  useEffect(() => {
    console.log('a 变化:', a);
  }, [a]);
  
  useEffect(() => {
    console.log('b 变化:', b);
  }, [b]);
  
  useEffect(() => {
    console.log('c 变化:', c);
  }, [c]);
}

// ✅ 使用自定义 Hook 追踪依赖
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用
function Component({ a, b, c }) {
  useWhyDidYouUpdate('Component', { a, b, c });
}
```

---

## 📝 核心要点总结

### 6 个关键认知

1. **useEffect 是"同步外部系统"的工具**  
   React 组件（纯函数） ↔ 外部世界（浏览器 API、网络、第三方库）。

2. **effect 在渲染完成后执行**  
   渲染 → 提交 DOM → 浏览器绘制 → useEffect。

3. **依赖数组决定何时重新执行**  
   无依赖数组：每次；空数组：一次；有依赖：依赖变化时。

4. **清理函数在下一次 effect 前或卸载时执行**  
   设置与清理代码紧邻，不易遗漏。

5. **依赖必须完整**  
   effect 中用到的所有外部值都应在依赖数组中（ESLint 检查）。

6. **数据请求需要处理取消、竞态、错误**  
   AbortController + ignore 标志 + 错误处理。

### 一句话总结

> **`useEffect` 是 React 把"副作用隔离、同步外部系统、时机控制、依赖追踪、自动清理"整合到一起的核心机制。它让组件保持纯函数特性，同时能安全地与外部世界交互。记住核心原则：effect 在渲染后执行，依赖数组决定执行时机，清理函数撤销副作用影响。**

---

## 🔗 相关笔记

- [React 状态更新](./react-state-updates.md) - useState 深度理解
- [JSX 深度理解](./jsx-deep-dive.md) - JSX 语法和原理
- [列表渲染与 map](./list-rendering-and-map.md) - 数组操作与 key

---

> **最后的话：** `useEffect` 是 React Hooks 中最复杂、最容易误用的 Hook 之一。首先要理解"为什么需要它"——它不是生命周期的替代品，而是"同步外部系统"的工具。理解了执行时机、依赖数组、清理函数的原理，能避免大量的 bug。记住核心原则：**effect 用于副作用，在渲染后执行；依赖数组要完整；副作用要清理**。对于数据请求，优先使用 TanStack Query 等专业库。养成正确的使用习惯，写出健壮的 React 代码！💪

