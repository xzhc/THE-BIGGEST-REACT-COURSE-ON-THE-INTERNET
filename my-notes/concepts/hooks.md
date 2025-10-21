# React Hooks 完整学习笔记

> 从基础到进阶，理解 React Hooks 的设计理念和使用场景

**学习日期：** 2025-10-21  
**相关项目：** `02. React Hooks/`, `03. Beginners Projects/`

---

## 📖 Hooks 是什么？

### 核心理念
- **函数组件**也能使用状态和生命周期
- **逻辑复用**更简单（不需要 HOC 或 Render Props）
- **关注点分离**更清晰（相关逻辑放在一起）

### 使用规则
1. ✅ 只在**函数组件顶层**调用
2. ✅ 只在**React 函数**中调用（组件或自定义 Hook）
3. ❌ 不在循环、条件、嵌套函数中调用

---

## 1️⃣ useState - 状态管理

### 基本用法
```tsx
const [count, setCount] = useState(0);

// 更新状态
setCount(1);

// 函数式更新
setCount(prev => prev + 1);
```

### 💡 关键理解

#### 状态更新是异步的
```tsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count); // ❌ 还是 0，不是 1
};
```

#### 为什么需要函数式更新？
```tsx
// ❌ 错误：连续调用只会 +1
setCount(count + 1);
setCount(count + 1);

// ✅ 正确：使用函数式更新会 +2
setCount(prev => prev + 1);
setCount(prev => prev + 1);
```

**原因：** 每次 render 的 `count` 是一个独立的值（闭包）

### ⚠️ 常见陷阱

#### 陷阱 1：对象/数组更新
```tsx
const [user, setUser] = useState({ name: 'Tom', age: 20 });

// ❌ 错误：直接修改不会触发重渲染
user.age = 21;
setUser(user);

// ✅ 正确：创建新对象
setUser({ ...user, age: 21 });
```

#### 陷阱 2：初始化性能问题
```tsx
// ❌ 每次 render 都会执行 expensiveComputation
const [data, setData] = useState(expensiveComputation());

// ✅ 惰性初始化：只在首次 render 执行
const [data, setData] = useState(() => expensiveComputation());
```

### 📍 在项目中的位置
- `02. React Hooks/1. useState/Example.jsx`
- `03. Beginners Projects/01. Counter/App.jsx`

---

## 2️⃣ useEffect - 副作用处理

### 基本用法
```tsx
useEffect(() => {
  // 副作用代码
  document.title = `Count: ${count}`;
}, [count]); // 依赖数组
```

### 💡 依赖数组的三种情况

```tsx
// 1. 无依赖数组 - 每次 render 都执行（❌ 通常不推荐）
useEffect(() => {
  console.log('Every render');
});

// 2. 空依赖数组 - 只执行一次（✅ 相当于 componentDidMount）
useEffect(() => {
  console.log('Once on mount');
}, []);

// 3. 有依赖 - 依赖变化时执行（✅ 最常用）
useEffect(() => {
  console.log('When count changes');
}, [count]);
```

### 💡 清理函数的使用

```tsx
useEffect(() => {
  // 订阅事件
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  // 清理函数：组件卸载或依赖变化前执行
  return () => {
    clearInterval(timer);
  };
}, []);
```

**执行顺序：**
1. 组件首次渲染 → 执行 effect
2. 依赖变化 → 先执行清理函数 → 再执行新的 effect
3. 组件卸载 → 执行清理函数

### ⚠️ 常见陷阱

#### 陷阱 1：无限循环
```tsx
const [count, setCount] = useState(0);

// ❌ 无限循环
useEffect(() => {
  setCount(count + 1); // 触发 render → 触发 effect → 触发 render...
}); // 没有依赖数组

// ✅ 解决方案 1：添加依赖数组
useEffect(() => {
  setCount(count + 1);
}, []); // 只执行一次

// ✅ 解决方案 2：条件判断
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

#### 陷阱 2：依赖数组中的对象
```tsx
const [user, setUser] = useState({ name: 'Tom' });

// ❌ 每次 render 都执行（对象引用每次都不同）
useEffect(() => {
  console.log('User changed');
}, [user]);

// ✅ 只依赖需要的属性
useEffect(() => {
  console.log('User name changed');
}, [user.name]);
```

#### 陷阱 3：闭包陷阱
```tsx
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // ❌ 永远是 0（闭包捕获的是初始值）
  }, 1000);
  
  return () => clearInterval(timer);
}, []); // 空依赖数组

// ✅ 解决方案 1：添加依赖
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // ✅ 最新的 count
  }, 1000);
  
  return () => clearInterval(timer);
}, [count]); // 添加 count 依赖

// ✅ 解决方案 2：使用 ref
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current); // ✅ 最新的 count
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

### 📍 在项目中的位置
- `02. React Hooks/2. useEffect/`
- `03. Beginners Projects/03. Meals API Project/`

---

## 3️⃣ useContext - 跨组件传递数据

### 基本用法
```tsx
// 1. 创建 Context
const ThemeContext = createContext<'light' | 'dark'>('light');

// 2. 提供 Context
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <Child />
    </ThemeContext.Provider>
  );
}

// 3. 消费 Context
function Child() {
  const theme = useContext(ThemeContext);
  return <div>Current theme: {theme}</div>;
}
```

### 💡 什么时候用 Context？
- ✅ 全局主题、语言设置
- ✅ 用户认证信息
- ✅ 深层嵌套的组件通信
- ❌ 频繁变化的状态（会导致所有消费者重渲染）

### 📍 在项目中的位置
- `02. React Hooks/4. Context/`
- `04. React w TypeScript/7. Context API/`

---

## 4️⃣ useReducer - 复杂状态管理

### 基本用法
```tsx
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

### 💡 useReducer vs useState

| 场景 | 推荐 |
|------|------|
| 简单的独立状态 | useState |
| 多个相关状态 | useReducer |
| 复杂的状态逻辑 | useReducer |
| 需要状态历史/撤销 | useReducer |

### 📍 在项目中的位置
- `02. React Hooks/5. useReducer/`
- `04. React w TypeScript/8. useReducer/`

---

## 5️⃣ useRef - 引用 DOM 或保存可变值

### 用途 1：引用 DOM
```tsx
const inputRef = useRef<HTMLInputElement>(null);

const focusInput = () => {
  inputRef.current?.focus();
};

return <input ref={inputRef} />;
```

### 用途 2：保存可变值（不触发重渲染）
```tsx
const countRef = useRef(0);

const handleClick = () => {
  countRef.current += 1; // 不触发重渲染
  console.log(countRef.current);
};
```

### 💡 useRef vs useState

| 特性 | useRef | useState |
|------|--------|----------|
| 修改时重渲染 | ❌ 否 | ✅ 是 |
| 获取最新值 | ✅ 立即 | ❌ 下次渲染 |
| 使用场景 | DOM 引用、定时器 ID | UI 状态 |

### 📍 在项目中的位置
- `02. React Hooks/6. useRef/`

---

## 🎓 自定义 Hooks

### 什么是自定义 Hook？
- 以 `use` 开头的函数
- 内部可以调用其他 Hooks
- 用于**逻辑复用**

### 示例：useLocalStorage
```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

### 📍 在项目中的位置
- `02. React Hooks/7. Custom Hooks/`

---

## 🐛 我遇到的问题

### 问题 1：useEffect 依赖数组警告
**详见：** `debugging/2025-10-xx-useEffect-deps.md`

---

## 🔗 延伸学习

### 下一步
- [ ] 学习性能优化 Hooks（useMemo, useCallback）
- [ ] 深入理解闭包对 Hooks 的影响
- [ ] 学习 React 19 新 Hooks

### 相关笔记
- [状态管理对比](state-management.md)
- [TypeScript + React](typescript-react.md)

---

**最后更新：** 2025-10-21

