## Custom Hooks 核心笔记

### 1. 是什么？

Custom Hooks（自定义 Hooks）是**提取和复用组件逻辑**的 JavaScript 函数。

核心特点：
- 函数名必须以 `use` 开头（如 `useFetch`、`useLocalStorage`）
- 内部可以调用其他 React Hooks（useState、useEffect 等）
- 返回值可以是任意类型（值、数组、对象等）
- 本质是**逻辑复用**，而不是状态共享

### 2. 为什么用？

解决代码复用问题：
- **避免重复代码**：多个组件有相同的逻辑（如数据获取、表单处理）
- **关注点分离**：把复杂逻辑从组件中抽离，组件更简洁
- **易于测试**：逻辑独立，可单独测试
- **团队协作**：封装通用逻辑，提高开发效率

### 3. 怎么用？

#### 创建 Custom Hook

```jsx
// 文件名：useFetch.js
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
```

#### 使用 Custom Hook

```jsx
import useFetch from './useFetch';

function UserList() {
  // 像使用内置 Hook 一样使用
  const { data, loading, error } = useFetch('https://api.example.com/users');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 4. 应用场景

#### 场景 1：数据获取（useFetch）

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      });

    // 清理函数：组件卸载时取消请求
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// 使用示例
function Posts() {
  const { data, loading, error } = useFetch('/api/posts');
  // ... 渲染逻辑
}

function Todos() {
  const { data, loading, error } = useFetch('/api/todos');
  // ... 渲染逻辑（复用相同逻辑）
}
```

#### 场景 2：本地存储同步（useLocalStorage）

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 值改变时保存到 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue];
}

// 使用示例
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题：{theme}
    </button>
  );
}
```

#### 场景 3：表单输入管理（useInput）

```jsx
import { useState } from 'react';

function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(initialValue);
  };

  return {
    value,
    onChange: handleChange,
    reset
  };
}

// 使用示例
function LoginForm() {
  const email = useInput('');
  const password = useInput('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('登录信息：', email.value, password.value);
    email.reset();
    password.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" {...email} placeholder="邮箱" />
      <input type="password" {...password} placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  );
}
```

#### 场景 4：窗口尺寸监听（useWindowSize）

```jsx
import { useState, useEffect } from 'react';

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

// 使用示例
function ResponsiveComponent() {
  const { width } = useWindowSize();

  return (
    <div>
      {width < 768 ? '移动端视图' : '桌面端视图'}
      <p>当前宽度：{width}px</p>
    </div>
  );
}
```

### 5. 完整示例：综合应用

```jsx
// hooks/useAsync.js - 通用异步处理 Hook
import { useState, useEffect, useCallback } from 'react';

function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setData(null);
    setError(null);

    return asyncFunction()
      .then(response => {
        setData(response);
        setStatus('success');
      })
      .catch(error => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { data, status, error, execute } = useAsync(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    true  // 立即执行
  );

  if (status === 'pending') return <div>加载中...</div>;
  if (status === 'error') return <div>错误：{error.message}</div>;
  if (status === 'success') {
    return (
      <div>
        <h1>{data.name}</h1>
        <button onClick={execute}>刷新</button>
      </div>
    );
  }
  return null;
}
```

### 6. 核心规则

✅ **必须遵守的规则**：

1. **命名必须以 `use` 开头**
   ```jsx
   ✅ useFetch、useLocalStorage
   ❌ fetchData、localStorage
   ```

2. **只能在顶层调用**（和内置 Hooks 规则相同）
   ```jsx
   ❌ 不能在循环、条件、嵌套函数中调用
   ✅ 在组件或其他 Custom Hook 顶层调用
   ```

3. **只能在 React 函数组件或其他 Custom Hook 中调用**
   ```jsx
   ✅ 在函数组件中调用
   ✅ 在其他 Custom Hook 中调用
   ❌ 在普通 JavaScript 函数中调用
   ```

### 7. 最佳实践

#### ✅ 好的做法

```jsx
// 1. 返回对象（语义清晰，易于扩展）
function useUser(id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  return { user, loading, setUser };  // ✅ 清晰
}

// 2. 提供清理逻辑
function useSubscription(channel) {
  useEffect(() => {
    const subscription = subscribe(channel);
    return () => subscription.unsubscribe();  // ✅ 清理
  }, [channel]);
}

// 3. 依赖项完整
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);  // ✅ 完整依赖
  
  return debouncedValue;
}
```

#### ❌ 避免的错误

```jsx
// 1. 不要在条件中调用
function Bad({ shouldFetch }) {
  if (shouldFetch) {
    const data = useFetch('/api');  // ❌ 错误
  }
}

// 2. 不要在循环中调用
function Bad({ urls }) {
  urls.forEach(url => {
    const data = useFetch(url);  // ❌ 错误
  });
}

// 3. 不要忘记清理副作用
function Bad() {
  useEffect(() => {
    const interval = setInterval(() => {}, 1000);
    // ❌ 忘记清理，会导致内存泄漏
  }, []);
}
```

### 8. Custom Hooks vs 其他复用方式

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Custom Hooks** | 复用逻辑和状态、符合 React 模式 | 只能在组件中使用 | 有状态的逻辑复用 |
| **普通函数** | 通用、简单 | 不能使用 Hooks | 纯计算逻辑 |
| **高阶组件 HOC** | 可复用组件逻辑 | 嵌套地狱、props 混淆 | 老项目、跨层级逻辑 |
| **Render Props** | 灵活 | JSX 嵌套复杂 | 需要动态渲染 |

### 9. 快速决策

**什么时候创建 Custom Hook？**
- ✅ 多个组件有相同的逻辑（数据获取、订阅、定时器等）
- ✅ 逻辑涉及 useState、useEffect 等 React Hooks
- ✅ 想让组件更简洁、关注点分离
- ✅ 逻辑需要独立测试

**什么时候用普通函数？**
- ✅ 纯计算逻辑，不涉及状态和副作用
- ✅ 需要在非 React 环境使用
- ✅ 简单的工具函数（格式化、验证等）

---

**记住**：Custom Hooks 是逻辑复用而非状态共享。每次调用都会创建独立的状态和副作用。

