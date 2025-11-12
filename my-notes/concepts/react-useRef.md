## useRef 核心笔记

### 1. 是什么？

`useRef` 是 React 的一个 Hook，用于创建一个**可变的引用对象**，这个对象在组件的整个生命周期中保持不变。

核心特点：
- 返回一个对象：`{ current: 任意值 }`
- 修改 `ref.current` **不会触发组件重新渲染**
- 在多次渲染之间保持同一个引用

### 2. 为什么用？

解决两个核心问题：
1. **访问 DOM 元素**：需要直接操作 DOM（聚焦、滚动、测量等）
2. **保存数据但不触发渲染**：需要记住某些值，但改变它时不希望组件重新渲染（如定时器 ID、前一次的值等）

### 3. 怎么用？

```jsx
import { useRef } from 'react';

function MyComponent() {
  // 创建 ref
  const myRef = useRef(初始值);
  
  // 读取/修改
  const value = myRef.current;
  myRef.current = 新值;  // 不会触发重渲染
}
```

### 4. 应用场景

#### 场景 1：操作 DOM 元素

```jsx
import { useRef } from 'react';

function FocusInput() {
  const inputRef = useRef(null);

  const handleClick = () => {
    // 直接访问 DOM 节点
    inputRef.current?.focus();
    inputRef.current.value = 'Hello';
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>聚焦并填充</button>
    </>
  );
}
```

#### 场景 2：存储不触发渲染的值

```jsx
import { useRef, useState } from 'react';

function Timer() {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);  // 保存定时器 ID

  const start = () => {
    if (timerRef.current) return; // 防止重复启动
    timerRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

#### 场景 3：记住上一次的值

```jsx
import { useRef, useEffect } from 'react';

function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;  // 在渲染后更新
  });
  
  return ref.current;  // 返回渲染前的旧值
}

// 使用
function Counter({ count }) {
  const prevCount = usePrevious(count);
  return <div>当前: {count}, 之前: {prevCount}</div>;
}
```

### 5. 完整示例：综合应用

```jsx
import { useRef, useState, useEffect } from 'react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);           // DOM 引用
  const [isPlaying, setIsPlaying] = useState(false);
  const renderCountRef = useRef(0);        // 渲染次数计数

  // 记录渲染次数（不触发重渲染）
  renderCountRef.current += 1;

  // 控制播放
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 自动聚焦
  useEffect(() => {
    videoRef.current?.focus();
  }, []);

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={togglePlay}>
        {isPlaying ? '暂停' : '播放'}
      </button>
      <p>组件已渲染 {renderCountRef.current} 次</p>
    </div>
  );
}
```

### 6. 核心要点总结

| 特性 | useRef | useState |
|------|--------|----------|
| 修改触发渲染 | ❌ 否 | ✅ 是 |
| 引用稳定性 | ✅ 始终同一对象 | ❌ 每次渲染新值 |
| 主要用途 | DOM 操作、缓存数据 | 驱动 UI 的状态 |
| 更新时机 | 立即 | 下次渲染 |

### 7. 常见陷阱

❌ **不要在渲染期间读写 `ref.current`**
```jsx
// ❌ 错误：渲染不纯
function Bad() {
  const ref = useRef(0);
  ref.current += 1;  // 渲染期间修改，违反纯函数原则
  return <div>{ref.current}</div>;
}
```

✅ **在事件处理或 useEffect 中修改**
```jsx
// ✅ 正确
function Good() {
  const ref = useRef(0);
  
  const handleClick = () => {
    ref.current += 1;  // 事件处理中修改
    console.log(ref.current);
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

❌ **值是业务状态时不要用 ref**
```jsx
// ❌ 错误：用户输入应该是受控状态
function Bad() {
  const inputRef = useRef();
  const submit = () => {
    console.log(inputRef.current.value);  // 不受控
  };
}

// ✅ 正确：值作为状态管理
function Good() {
  const [value, setValue] = useState('');
  const submit = () => {
    console.log(value);  // 受控
  };
}
```

### 8. 快速决策

**什么时候用 `useRef`？**
- ✅ 需要访问 DOM（focus、scroll、测量）
- ✅ 存储定时器 ID、订阅对象
- ✅ 记住上一次的值
- ✅ 缓存昂贵计算结果但不希望重渲染

**什么时候用 `useState`？**
- ✅ 数据变化需要更新 UI
- ✅ 数据参与表单提交、校验
- ✅ 数据需要跨组件传递

---

**记住**：`useRef` 是 React 的"逃生舱"，用于命令式操作。优先考虑声明式的 `useState`，只在必要时使用 `useRef`。

