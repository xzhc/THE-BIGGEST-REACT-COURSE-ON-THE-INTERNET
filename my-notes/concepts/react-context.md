# React Context：跨层级数据传递完全指南

> **学习日期：** 2025-10-29  
> **主题：** Context API、useContext Hook 与跨组件通信  
> **来源：** React Hooks 实战与深度理解

---

## 📚 目录

1. [为什么需要 Context？](#1-为什么需要-context)
2. [问题引入：Prop Drilling](#2-问题引入prop-drilling)
3. [Context 的三个核心概念](#3-context-的三个核心概念)
4. [基础用法：Consumer 模式](#4-基础用法consumer-模式)
5. [现代用法：useContext Hook](#5-现代用法usecontext-hook)
6. [Context 的工作原理](#6-context-的工作原理)
7. [Context vs 状态管理](#7-context-vs-状态管理)
8. [Context 的默认值](#8-context-的默认值)
9. [性能优化策略](#9-性能优化策略)
10. [最佳实践：自定义 Provider](#10-最佳实践自定义-provider)
11. [常见使用场景](#11-常见使用场景)
12. [常见错误与陷阱](#12-常见错误与陷阱)
13. [Context vs 其他方案](#13-context-vs-其他方案)
14. [最佳实践总结](#14-最佳实践总结)
15. [进阶话题](#15-进阶话题)

---

## 1. 为什么需要 Context？

> **核心问题：** React 为什么要发明 Context？它解决了什么问题？如果不用它，会遇到什么困难？

---

### Context 解决的核心问题

在理解"如何使用 Context"之前，先要理解"为什么需要 Context"。Context 是 React 处理**跨层级数据传递**的官方解决方案。

#### React 的数据流：单向数据流

**React 的基本规则**：数据通过 props 从父组件流向子组件

```jsx
// ✅ React 的标准数据流
function App() {
  const user = 'HuXn';
  return <Child user={user} />;
}

function Child({ user }) {
  return <div>Hello, {user}</div>;
}
```

**这种方式在简单场景下很好**：
- 数据流向清晰
- 易于理解和追踪
- 组件解耦

**但在深层嵌套时就会出现问题**...

---

## 2. 问题引入：Prop Drilling

> **Prop Drilling（属性钻取）**：当数据需要传递给深层嵌套的组件时，必须通过所有中间组件逐层传递，即使中间组件并不需要这些数据。

### 场景示例：用户信息需要传递 3 层

```jsx
// ❌ 问题：Prop Drilling
function App() {
  const userName = 'HuXn';
  const userAge = 19;
  
  // App 需要这些数据
  return <ComponentA userName={userName} userAge={userAge} />;
}

function ComponentA({ userName, userAge }) {
  // ComponentA 不需要这些数据，但必须接收并传递
  return <ComponentB userName={userName} userAge={userAge} />;
}

function ComponentB({ userName, userAge }) {
  // ComponentB 也不需要，但还是必须继续传递
  return <ComponentC userName={userName} userAge={userAge} />;
}

function ComponentC({ userName, userAge }) {
  // ComponentC 才真正需要这些数据！
  return <h1>My name is {userName}, I'm {userAge} years old.</h1>;
}
```

### Prop Drilling 的问题

**维护困难：**
```
App (有数据)
 ├─ ComponentA (不需要，但要接收和传递)
     ├─ ComponentB (不需要，但要接收和传递)
         ├─ ComponentC (真正需要！)
```

**具体问题：**
1. **代码冗余**：每一层都要写相同的 props 传递代码
2. **难以维护**：添加新数据时，需要修改所有中间组件
3. **组件耦合**：中间组件被迫依赖它不需要的 props
4. **重构困难**：调整组件层级时，需要大量修改

**如果有 10 层嵌套呢？20 层呢？**

---

### Context 如何解决？

Context 提供了一种"隧道"机制，让数据直接从顶层组件传递到任意深层组件，跳过所有中间层：

```jsx
// ✅ 使用 Context：中间层不需要传递
function App() {
  const userName = 'HuXn';
  const userAge = 19;
  
  return (
    <UserContext.Provider value={{ userName, userAge }}>
      <ComponentA />  {/* 不需要 props！ */}
    </UserContext.Provider>
  );
}

function ComponentA() {
  // 不需要接收和传递 props
  return <ComponentB />;
}

function ComponentB() {
  // 还是不需要
  return <ComponentC />;
}

function ComponentC() {
  // 直接从 Context 获取数据！
  const { userName, userAge } = useContext(UserContext);
  return <h1>My name is {userName}, I'm {userAge} years old.</h1>;
}
```

**关键优势：**
- ✅ 中间组件完全解耦
- ✅ 数据源和消费者之间建立直接连接
- ✅ 添加新数据时，不需要修改中间组件
- ✅ 组件层级调整时，不影响数据传递

---

## 3. Context 的三个核心概念

Context 的使用分为三个步骤，像"广播电台"模型：

```
1. createContext  →  创建电台频道
2. Provider       →  发射信号（提供数据）
3. Consumer/Hook  →  接收信号（消费数据）
```

### 1️⃣ 创建 Context：createContext()

```jsx
import { createContext } from 'react';

// 创建一个 Context 对象
export const UserContext = createContext();

// 可以设置默认值（可选）
export const ThemeContext = createContext('light');
```

**关键点：**
- `createContext()` 返回一个 Context 对象
- 每个 Context 是独立的"数据通道"
- **必须 export**，因为消费者需要导入它
- 可以传入默认值（后面详细讲）

---

### 2️⃣ 提供数据：Provider 组件

```jsx
function App() {
  const userName = 'HuXn';
  
  return (
    // Provider 包裹需要访问数据的组件树
    <UserContext.Provider value={userName}>
      <Header />
      <MainContent />
      <Footer />
    </UserContext.Provider>
  );
}
```

**关键点：**
- `<Context.Provider>` 是数据的"发射器"
- `value` 属性指定要共享的数据
- **所有被 Provider 包裹的子组件**都能访问这个数据
- Provider 可以嵌套使用

---

### 3️⃣ 消费数据：Consumer 或 useContext

有两种方式消费 Context 数据：

#### 方式 1：Consumer 组件（老式 API）

```jsx
function ComponentC() {
  return (
    <UserContext.Consumer>
      {(userName) => (
        <h1>Hello, {userName}</h1>
      )}
    </UserContext.Consumer>
  );
}
```

#### 方式 2：useContext Hook（推荐）⭐

```jsx
function ComponentC() {
  const userName = useContext(UserContext);
  return <h1>Hello, {userName}</h1>;
}
```

---

## 4. 基础用法：Consumer 模式

### 完整示例：使用 Consumer

这是较老的 API，但理解它有助于理解 Context 的工作机制。

#### 1. 创建 Context

```jsx
// App.jsx
import { createContext } from 'react';

// 创建 Context 实例
export const DataContext = createContext();
export const AgeContext = createContext();
```

#### 2. 提供数据

```jsx
// App.jsx
function App() {
  const name = "HuXn";
  const age = 19;

  return (
    <DataContext.Provider value={name}>
      <AgeContext.Provider value={age}>
        <ComponentA />
      </AgeContext.Provider>
    </DataContext.Provider>
  );
}

export default App;
```

#### 3. 中间组件（无需传递 props）

```jsx
// ComponentA.jsx
function ComponentA() {
  // 不需要接收任何 props
  return <ComponentB />;
}

// ComponentB.jsx
function ComponentB() {
  // 还是不需要
  return <ComponentC />;
}
```

#### 4. 消费数据

```jsx
// ComponentC.jsx
import { DataContext, AgeContext } from './App';

function ComponentC() {
  return (
    <DataContext.Consumer>
      {(name) => (
        <AgeContext.Consumer>
          {(age) => (
            <h1>
              My name is: {name} and I'm {age} years old.
            </h1>
          )}
        </AgeContext.Consumer>
      )}
    </DataContext.Consumer>
  );
}

export default ComponentC;
```

### Consumer 模式的问题

**❌ 多个 Context 时的"嵌套地狱"**：

```jsx
// 3 个 Context 就已经很难读了
<UserContext.Consumer>
  {(user) => (
    <ThemeContext.Consumer>
      {(theme) => (
        <LanguageContext.Consumer>
          {(language) => (
            <div>
              {/* 实际的 UI */}
            </div>
          )}
        </LanguageContext.Consumer>
      )}
    </ThemeContext.Consumer>
  )}
</UserContext.Consumer>
```

**缺点：**
- 代码嵌套太深（Callback Hell）
- 可读性差
- 难以维护
- 不符合现代 React 的 Hooks 风格

**解决方案：使用 useContext Hook** ⬇️

---

## 5. 现代用法：useContext Hook

### useContext 的优势

`useContext` 是消费 Context 的现代方式，完全替代 Consumer 组件。

**对比 Consumer 和 useContext：**

```jsx
// ❌ 老式：Consumer（代码嵌套）
function ComponentC() {
  return (
    <UserContext.Consumer>
      {(user) => (
        <ThemeContext.Consumer>
          {(theme) => (
            <h1 style={{ color: theme }}>Hello, {user}</h1>
          )}
        </ThemeContext.Consumer>
      )}
    </UserContext.Consumer>
  );
}

// ✅ 现代：useContext（扁平化）
function ComponentC() {
  const user = useContext(UserContext);
  const theme = useContext(ThemeContext);
  
  return <h1 style={{ color: theme }}>Hello, {user}</h1>;
}
```

---

### 完整示例：使用 useContext

#### 1. 创建 Context

```jsx
// App.jsx
import { createContext } from 'react';

export const DataContext = createContext();
export const AgeContext = createContext();
```

#### 2. 提供数据

```jsx
// App.jsx
function App() {
  const name = "HuXn";
  const age = 18;

  return (
    <DataContext.Provider value={name}>
      <AgeContext.Provider value={age}>
        <ComponentA />
      </AgeContext.Provider>
    </DataContext.Provider>
  );
}
```

#### 3. 消费数据

```jsx
// ComponentC.jsx
import { useContext } from 'react';
import { DataContext, AgeContext } from './App';

function ComponentC() {
  // 直接获取数据，清晰简洁！
  const userName = useContext(DataContext);
  const age = useContext(AgeContext);

  return (
    <h1>
      My name is: {userName} & I'm {age} years old.
    </h1>
  );
}

export default ComponentC;
```

---

### useContext 的使用规则

#### ✅ 正确用法

```jsx
import { useContext } from 'react';
import { UserContext } from './contexts';

function MyComponent() {
  // 1. 在函数组件顶层调用
  const user = useContext(UserContext);
  
  // 2. 可以调用多次
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  
  return <div>{user.name}</div>;
}
```

#### ❌ 错误用法

```jsx
function MyComponent() {
  if (condition) {
    // ❌ 不能在条件语句中
    const user = useContext(UserContext);
  }
  
  for (let i = 0; i < 10; i++) {
    // ❌ 不能在循环中
    const user = useContext(UserContext);
  }
  
  function handleClick() {
    // ❌ 不能在普通函数中
    const user = useContext(UserContext);
  }
  
  return <div>...</div>;
}
```

**原因：** useContext 是 Hook，必须遵循 [Hooks 规则](https://react.dev/reference/rules)

---

## 6. Context 的工作原理

### Context 的本质

**Context 不是状态管理工具！** 它只是数据的"传送带"。

```
useState/useReducer  →  管理状态（数据源）
Context              →  传递数据（传输通道）
```

#### 用比喻理解：

```
useState  = 数据的"仓库" 📦
Context   = 数据的"快递系统" 🚚
```

---

### Context 不存储状态

```jsx
// ❌ 误解：以为 Context 存储了状态
const UserContext = createContext();

function App() {
  return (
    <UserContext.Provider value="HuXn">
      {/* 这个 "HuXn" 是写死的，不是状态！ */}
    </UserContext.Provider>
  );
}
```

```jsx
// ✅ 正确理解：Context + useState = 全局状态管理
const UserContext = createContext();

function App() {
  // 1. useState 管理状态（数据的真正来源）
  const [user, setUser] = useState('HuXn');
  
  // 2. Context 传递状态（让深层组件能访问）
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ComponentA />
    </UserContext.Provider>
  );
}
```

---

### 订阅-发布模式

Context 使用"订阅-发布"模式实现跨层级通信：

```jsx
// 1. Provider 发布数据
<UserContext.Provider value={userData}>
  <App />
</UserContext.Provider>

// 2. 所有使用 useContext(UserContext) 的组件自动订阅

// 3. 当 value 改变时，React 通知所有订阅者重新渲染
```

**关键机制：**
- Provider 的 `value` 改变时，React 会遍历所有订阅了该 Context 的组件
- 使用 `Object.is()` 比较 value 是否改变
- 如果改变，触发订阅组件的重渲染
- **即使中间组件使用了 `React.memo`，也会穿透直达订阅组件**

---

### 示例：Context 触发重渲染

```jsx
function App() {
  const [count, setCount] = useState(0);
  
  console.log('App render');
  
  return (
    <UserContext.Provider value={count}>
      <Child />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </UserContext.Provider>
  );
}

const Child = React.memo(() => {
  console.log('Child render');  // 不会重渲染（memo 阻止）
  return <GrandChild />;
});

function GrandChild() {
  const count = useContext(UserContext);
  console.log('GrandChild render');  // 会重渲染（订阅了 Context）
  return <div>{count}</div>;
}

// 点击按钮后的输出：
// App render
// GrandChild render
// （注意：Child 没有重渲染）
```

**关键理解：**
- Context 更新会穿透 `React.memo`
- 只有订阅了 Context 的组件才会重渲染
- 中间组件如果没有订阅，不会重渲染

---

## 7. Context vs 状态管理

### Context 和 useState 的关系

很多人误解 Context 是状态管理工具，实际上：

```jsx
// Context 的 value 可以是任何数据
<Context.Provider value={123}>              // 数字
<Context.Provider value="hello">            // 字符串
<Context.Provider value={{ name: 'HuXn' }}> // 对象
<Context.Provider value={[1, 2, 3]}>        // 数组
<Context.Provider value={someFunction}>     // 函数
```

**Context 只是传递，真正的状态来自 useState/useReducer：**

```jsx
// useState 创造状态
const [user, setUser] = useState({ name: 'HuXn' });

// Context 分发状态
<UserContext.Provider value={{ user, setUser }}>
  {/* 任何深层组件都能访问和修改 */}
</UserContext.Provider>
```

---

### 对比表格

| 维度 | useState | Context | Context + useState |
|-----|---------|---------|-------------------|
| **作用** | 管理状态 | 传递数据 | 全局状态管理 |
| **能力** | 局部存储 | 跨层传递 | 全局存储+传递 |
| **比喻** | 仓库 📦 | 快递 🚚 | 全球物流 🌍 |
| **使用场景** | 组件内 | 跨层传递静态配置 | 全应用共享状态 |

---

### 场景选择

#### 场景 1：只需要 useState

```jsx
// 数据只在一个组件内使用
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 场景 2：只需要 Context（传递静态配置）

```jsx
// 传递不变的配置
const ApiConfig = createContext({
  baseUrl: 'https://api.example.com',
  timeout: 5000
});

function DataFetcher() {
  const config = useContext(ApiConfig);
  // 使用配置...
}
```

#### 场景 3：Context + useState（全局状态）

```jsx
// 需要全局共享且会变化的状态
function App() {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <MainContent />
    </UserContext.Provider>
  );
}
```

---

## 8. Context 的默认值

### 默认值的作用

```jsx
// 创建 Context 时可以提供默认值
const ThemeContext = createContext('light');
const UserContext = createContext({ name: 'Guest', age: 0 });
```

**默认值何时生效？**
- 当组件读取 Context，但**没有找到对应的 Provider** 时
- 默认值是"兜底方案"

---

### 示例：默认值的使用

```jsx
// 1. 创建 Context 并设置默认值
const ThemeContext = createContext('light');

// 2. 在没有 Provider 的情况下使用
function Button() {
  const theme = useContext(ThemeContext);
  console.log(theme);  // 输出 'light'（默认值）
  
  return <button className={theme}>Click me</button>;
}

// 3. App 中没有 Provider
function App() {
  return <Button />;  // 使用默认值
}
```

```jsx
// 4. 有 Provider 时，使用 Provider 的 value
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Button />  {/* 使用 'dark'，不是默认值 */}
    </ThemeContext.Provider>
  );
}
```

---

### 默认值的最佳实践

#### ✅ 推荐：提供有意义的默认值

```jsx
// 主题 Context
const ThemeContext = createContext('light');

// 认证 Context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

// 配置 Context
const ConfigContext = createContext({
  apiUrl: 'https://api.example.com',
  features: {
    darkMode: true,
    notifications: true
  }
});
```

#### ❌ 不推荐：不提供默认值

```jsx
// 如果忘记提供 Provider，会得到 undefined
const UserContext = createContext();

function Component() {
  const user = useContext(UserContext);
  console.log(user);  // undefined（容易导致错误）
  
  return <div>{user.name}</div>;  // 💥 Cannot read property 'name' of undefined
}
```

#### ⭐ 最佳实践：结合错误检查

```jsx
const UserContext = createContext(undefined);

function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  
  return context;
}
```

---

## 9. 性能优化策略

Context 的性能问题是最常被忽视的，也是最容易踩坑的地方。

### 问题：Context 更新导致大量组件重渲染

```jsx
// ❌ 性能问题
function App() {
  const [user, setUser] = useState({ name: 'HuXn', age: 19 });
  
  // 每次 App 渲染，都会创建新的对象引用
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {/* 100 个组件订阅了 UserContext */}
      {/* 即使 user 内容没变，所有组件都会重渲染！ */}
    </UserContext.Provider>
  );
}
```

**为什么会重渲染？**
- JavaScript 中 `{} !== {}`（引用比较）
- React 使用 `Object.is()` 比较 value
- 每次渲染创建新对象 → 引用变化 → 通知所有订阅者

---

### 优化策略 1：useMemo 缓存 value ⭐⭐⭐

```jsx
// ✅ 使用 useMemo
function App() {
  const [user, setUser] = useState({ name: 'HuXn', age: 19 });
  
  // 只有依赖项变化时才创建新对象
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {/* 只有 user 真正变化时才重渲染 */}
    </UserContext.Provider>
  );
}
```

**关键点：**
- useMemo 缓存对象引用
- 只有依赖项变化时才创建新对象
- 减少不必要的重渲染

---

### 优化策略 2：拆分 Context ⭐⭐⭐⭐

**问题：一个 Context 包含所有数据**

```jsx
// ❌ 所有数据在一个 Context
const AppContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'HuXn' });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme, language, setLanguage }}>
      {/* 任何一个数据变化，所有使用该 Context 的组件都会重渲染！ */}
    </AppContext.Provider>
  );
}

function UserProfile() {
  const { user } = useContext(AppContext);  // 只需要 user
  // 但 theme 或 language 变化时，这个组件也会重渲染！
}
```

**解决方案：按职责拆分**

```jsx
// ✅ 拆分成多个 Context
const UserContext = createContext();
const ThemeContext = createContext();
const LanguageContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'HuXn' });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <MainApp />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user } = useContext(UserContext);  // 只订阅 UserContext
  // theme 或 language 变化时，不会重渲染！
}
```

---

### 优化策略 3：React.memo 阻止传播 ⭐⭐⭐

```jsx
// ✅ 使用 React.memo
const UserProfile = React.memo(() => {
  const { user } = useContext(UserContext);
  
  console.log('UserProfile render');
  
  return <div>{user.name}</div>;
});

// 如果 user 没有变化，即使父组件重渲染，UserProfile 也不会重渲染
```

**注意：** React.memo 无法阻止 Context 更新导致的重渲染！

```jsx
const Parent = React.memo(() => {
  console.log('Parent render');
  return <Child />;
});

function Child() {
  const user = useContext(UserContext);  // 订阅了 Context
  console.log('Child render');
  return <div>{user.name}</div>;
}

// 当 UserContext 更新时：
// - Parent 不会重渲染（memo 生效）
// - Child 会重渲染（Context 穿透 memo）
```

---

### 优化策略 4：状态分离 ⭐⭐⭐⭐⭐

**核心思想：** 把频繁变化的状态和不常变化的分开

```jsx
// ✅ 分离状态和更新函数
const UserStateContext = createContext();      // 状态（可能常变）
const UserDispatchContext = createContext();   // 更新函数（不变）

function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'HuXn' });
  
  // setUser 是稳定的函数引用，不会变化
  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// 只读取状态的组件
function UserDisplay() {
  const user = useContext(UserStateContext);  // 状态变化时会重渲染
  return <div>{user.name}</div>;
}

// 只需要更新函数的组件
function UserForm() {
  const setUser = useContext(UserDispatchContext);  // 永远不会因为状态变化而重渲染！
  
  return (
    <button onClick={() => setUser({ name: 'New Name' })}>
      Update User
    </button>
  );
}
```

---

### 优化对比总结

| 优化策略 | 适用场景 | 优先级 | 效果 |
|---------|---------|--------|------|
| useMemo 缓存 value | value 是对象/数组 | ⭐⭐⭐ | 避免引用变化导致的重渲染 |
| 拆分 Context | 多个独立的数据源 | ⭐⭐⭐⭐ | 减少订阅范围 |
| React.memo | 优化子组件 | ⭐⭐⭐ | 阻止父组件重渲染传播 |
| 状态分离 | 读写分离场景 | ⭐⭐⭐⭐⭐ | 最小化重渲染范围 |

---

## 10. 最佳实践：自定义 Provider

### 为什么需要自定义 Provider？

直接使用 Context 的问题：

```jsx
// ❌ 问题 1：逻辑分散
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const login = async (credentials) => {
    setLoading(true);
    // 登录逻辑...
    setLoading(false);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  // 所有逻辑都在 App 组件中，混乱！
  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      <App />
    </UserContext.Provider>
  );
}

// ❌ 问题 2：使用不友好
function SomeComponent() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('Must be used within Provider');  // 每次都要检查
  }
  
  const { user, login, logout } = context;
  // ...
}
```

---

### 最佳实践：创建自定义 Provider ⭐⭐⭐⭐⭐

**完整的 Context 模块结构：**

```jsx
// contexts/UserContext.jsx

import { createContext, useContext, useState } from 'react';

// 1. 创建 Context（不 export，强制使用自定义 Hook）
const UserContext = createContext(undefined);

// 2. 创建 Provider 组件
export function UserProvider({ children }) {
  // 状态管理
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 业务逻辑封装
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };
  
  const updateProfile = async (profileData) => {
    // 更新逻辑...
  };
  
  // 使用 useMemo 优化
  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      updateProfile
    }),
    [user, loading, error]  // login/logout/updateProfile 是稳定的函数
  );
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 3. 创建自定义 Hook（唯一的访问方式）
export function useUser() {
  const context = useContext(UserContext);
  
  // 错误检查：确保在 Provider 内部使用
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  
  return context;
}

// ⚠️ 注意：不 export UserContext，强制使用 useUser
```

---

### 使用自定义 Provider

#### 1. 在根组件包裹 Provider

```jsx
// App.jsx
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Header />
      <MainContent />
      <Footer />
    </UserProvider>
  );
}
```

#### 2. 在任何组件中使用

```jsx
// components/LoginForm.jsx
import { useUser } from '../contexts/UserContext';

function LoginForm() {
  const { login, loading, error } = useUser();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    login({
      email: formData.get('email'),
      password: formData.get('password')
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

```jsx
// components/UserProfile.jsx
import { useUser } from '../contexts/UserContext';

function UserProfile() {
  const { user, logout } = useUser();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

### 自定义 Provider 的优势

✅ **逻辑封装**：所有相关逻辑集中在一个文件  
✅ **类型安全**：TypeScript 中更容易添加类型  
✅ **错误处理**：统一的错误检查  
✅ **易于测试**：可以单独测试 Provider  
✅ **友好的 API**：提供自定义 Hook，使用简单  
✅ **强制规范**：不暴露 Context，必须通过 Hook 访问  

---

### 进阶：多 Provider 组合

```jsx
// contexts/AppProviders.jsx

export function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// App.jsx
import { AppProviders } from './contexts/AppProviders';

function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
```

---

## 11. 常见使用场景

### 场景 1：主题切换 ⭐⭐⭐⭐⭐

**最经典的 Context 应用场景**

```jsx
// contexts/ThemeContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // 从 localStorage 读取初始主题
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // 主题变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**使用：**

```jsx
// components/ThemeToggle.jsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

// components/Card.jsx
function Card() {
  const { theme } = useTheme();
  
  return (
    <div className={`card ${theme}`}>
      <h2>Card Title</h2>
    </div>
  );
}
```

---

### 场景 2：用户认证 ⭐⭐⭐⭐⭐

```jsx
// contexts/AuthContext.jsx

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 初始化：检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 验证 token 并获取用户信息
      fetchUser(token).then(setUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (credentials) => {
    const { user, token } = await api.login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const value = { user, loading, login, logout, isAuthenticated: !!user };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**使用：**

```jsx
// components/ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}

// pages/Dashboard.jsx
function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

### 场景 3：国际化（i18n）⭐⭐⭐⭐

```jsx
// contexts/LanguageContext.jsx

const translations = {
  en: {
    welcome: 'Welcome',
    logout: 'Logout'
  },
  zh: {
    welcome: '欢迎',
    logout: '登出'
  }
};

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
```

**使用：**

```jsx
function Header() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <header>
      <h1>{t('welcome')}</h1>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </header>
  );
}
```

---

### 场景 4：全局通知系统 ⭐⭐⭐⭐

```jsx
// contexts/NotificationContext.jsx

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // 3 秒后自动移除
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    info: (msg) => addNotification(msg, 'info')
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationList notifications={notifications} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
```

**使用：**

```jsx
function SaveButton() {
  const { success, error } = useNotification();
  
  const handleSave = async () => {
    try {
      await api.save();
      success('保存成功！');
    } catch (err) {
      error('保存失败：' + err.message);
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

### 场景 5：购物车状态 ⭐⭐⭐⭐

```jsx
// contexts/CartContext.jsx

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  
  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const removeItem = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => setItems([]);
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

**使用：**

```jsx
// components/ProductCard.jsx
function ProductCard({ product }) {
  const { addItem } = useCart();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>Add to Cart</button>
    </div>
  );
}

// components/CartBadge.jsx
function CartBadge() {
  const { itemCount } = useCart();
  
  return (
    <div className="cart-badge">
      🛒 {itemCount}
    </div>
  );
}

// pages/Checkout.jsx
function Checkout() {
  const { items, total, clearCart } = useCart();
  
  return (
    <div>
      <h2>购物车</h2>
      {items.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity} = ${item.price * item.quantity}
        </div>
      ))}
      <div>总计：${total}</div>
      <button onClick={clearCart}>清空购物车</button>
    </div>
  );
}
```

---

## 12. 常见错误与陷阱

### 错误 1：忘记提供 Provider ❌

```jsx
// ❌ 错误：使用 Context 但没有 Provider
function App() {
  return <UserProfile />;  // 没有 UserProvider！
}

function UserProfile() {
  const user = useContext(UserContext);  // undefined（如果没设置默认值）
  return <div>{user.name}</div>;  // 💥 报错
}
```

**解决方案：**

```jsx
// ✅ 正确：提供 Provider
function App() {
  return (
    <UserProvider>
      <UserProfile />
    </UserProvider>
  );
}

// ⭐ 更好：自定义 Hook 中检查
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

---

### 错误 2：每次渲染创建新对象 ❌

```jsx
// ❌ 性能问题：每次渲染都创建新对象
function App() {
  const [user, setUser] = useState({ name: 'HuXn' });
  
  return (
    // 💥 每次渲染都是新的对象引用
    <UserContext.Provider value={{ user, setUser }}>
      <Children />
    </UserContext.Provider>
  );
}
```

**解决方案：**

```jsx
// ✅ 使用 useMemo
function App() {
  const [user, setUser] = useState({ name: 'HuXn' });
  
  const value = useMemo(() => ({ user, setUser }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      <Children />
    </UserContext.Provider>
  );
}
```

---

### 错误 3：Context 嵌套过深 ❌

```jsx
// ❌ Context 地狱
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <CartProvider>
              <ModalProvider>
                <ToastProvider>
                  <MainApp />
                </ToastProvider>
              </ModalProvider>
            </CartProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

**解决方案：**

```jsx
// ✅ 创建组合 Provider
function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
```

---

### 错误 4：在 Context 中存储频繁变化的数据 ❌

```jsx
// ❌ 问题：鼠标位置频繁变化
function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return (
    <MouseContext.Provider value={mousePosition}>
      {/* 💥 所有订阅的组件每次鼠标移动都会重渲染！ */}
    </MouseContext.Provider>
  );
}
```

**解决方案：**

```jsx
// ✅ 方案 1：不用 Context，用本地状态
function Component() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // 只有这个组件会重渲染
}

// ✅ 方案 2：使用状态管理库（如 Zustand）
// ✅ 方案 3：使用 refs + 事件系统（不触发渲染）
```

---

### 错误 5：过度使用 Context ❌

```jsx
// ❌ 什么都用 Context
const FormDataContext = createContext();     // 表单数据（应该是组件内状态）
const ModalOpenContext = createContext();    // 模态框状态（应该是组件内状态）
const HoverStateContext = createContext();   // hover 状态（应该是组件内状态）
```

**原则：**
- ✅ 只在需要跨层级传递时使用 Context
- ✅ 不要把所有状态都提升到全局
- ✅ 优先使用 props 和组件内状态

---

### 错误 6：在 useEffect 依赖中使用 Context 值 ⚠️

```jsx
// ⚠️ 可能导致无限循环
function Component() {
  const config = useContext(ConfigContext);  // 对象
  
  useEffect(() => {
    // 如果 config 是每次渲染都创建的新对象
    // 这个 effect 会无限执行！
    fetchData(config);
  }, [config]);  // 依赖项是对象
}
```

**解决方案：**

```jsx
// ✅ 方案 1：只依赖需要的字段
function Component() {
  const { apiUrl, timeout } = useContext(ConfigContext);
  
  useEffect(() => {
    fetchData(apiUrl, timeout);
  }, [apiUrl, timeout]);  // 依赖原始值
}

// ✅ 方案 2：在 Provider 中 useMemo
function ConfigProvider({ children }) {
  const config = useMemo(() => ({
    apiUrl: 'https://api.example.com',
    timeout: 5000
  }), []);  // 空依赖，永远不变
  
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
```

---

## 13. Context vs 其他方案

### Context vs Props

| 维度 | Props | Context |
|-----|-------|---------|
| **传递层级** | 逐层传递 | 跨层传递 |
| **适用场景** | 父子通信、浅层传递 | 深层传递、全局数据 |
| **数据流向** | 单向、显式 | 单向、隐式 |
| **可维护性** | 高（数据流清晰） | 中（隐式依赖） |
| **性能** | 好（按需传递） | 需要优化 |

**何时用 Props：**
- ✅ 直接父子组件通信
- ✅ 数据只传递 1-2 层
- ✅ 需要明确的数据流向

**何时用 Context：**
- ✅ 数据需要传递 3 层以上
- ✅ 全局配置（主题、语言）
- ✅ 用户认证状态

---

### Context vs Redux

| 维度 | Context | Redux |
|-----|---------|-------|
| **学习成本** | 低 | 高 |
| **功能** | 简单传递 | 完整状态管理 |
| **DevTools** | 无 | 有（时间旅行） |
| **中间件** | 无 | 有（异步、日志） |
| **性能优化** | 手动 | 自动（selector） |
| **适用规模** | 小到中型 | 中到大型 |

**何时用 Context：**
- ✅ 小型项目
- ✅ 简单的全局状态
- ✅ 不需要复杂的状态逻辑
- ✅ 主题、语言等配置

**何时用 Redux：**
- ✅ 大型项目
- ✅ 复杂的状态逻辑
- ✅ 需要时间旅行调试
- ✅ 多个模块共享状态

---

### Context vs Zustand

**Zustand** 是轻量级状态管理库，介于 Context 和 Redux 之间：

```jsx
// Context 方式
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

function Component() {
  const { user, setUser } = useContext(UserContext);
}

// Zustand 方式（更简洁）
import create from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

function Component() {
  const { user, setUser } = useUserStore();
}
```

**Zustand 的优势：**
- ✅ 无需 Provider
- ✅ 自动性能优化（selector）
- ✅ 更简洁的 API
- ✅ 支持中间件

**何时用 Zustand：**
- ✅ 需要全局状态但不想用 Redux
- ✅ 需要更好的性能（自动优化）
- ✅ 不想写 Provider 和 Context

---

## 14. 最佳实践总结

### ✅ DO - 应该做的

1. **使用 useContext 而不是 Consumer**
   ```jsx
   // ✅ 推荐
   const user = useContext(UserContext);
   
   // ❌ 不推荐
   <UserContext.Consumer>
     {user => ...}
   </UserContext.Consumer>
   ```

2. **创建自定义 Provider 和 Hook**
   ```jsx
   // ✅ 封装逻辑
   export function UserProvider({ children }) { ... }
   export function useUser() { ... }
   ```

3. **使用 useMemo 优化 value**
   ```jsx
   // ✅ 避免不必要的重渲染
   const value = useMemo(() => ({ user, setUser }), [user]);
   ```

4. **拆分 Context**
   ```jsx
   // ✅ 按职责拆分
   <UserContext.Provider>
   <ThemeContext.Provider>
   ```

5. **提供默认值**
   ```jsx
   // ✅ 避免 undefined
   const ThemeContext = createContext('light');
   ```

6. **添加错误检查**
   ```jsx
   // ✅ 友好的错误提示
   if (!context) {
     throw new Error('Must be used within Provider');
   }
   ```

---

### ❌ DON'T - 不应该做的

1. **不要把所有状态都放到 Context**
   ```jsx
   // ❌ 过度使用
   const AppContext = createContext();  // 包含所有数据
   
   // ✅ 优先使用本地状态
   const [count, setCount] = useState(0);
   ```

2. **不要在 Context 中存储频繁变化的数据**
   ```jsx
   // ❌ 鼠标位置（每次移动都触发）
   <MouseContext.Provider value={mousePosition}>
   
   // ✅ 使用本地状态或状态管理库
   ```

3. **不要忘记 useMemo**
   ```jsx
   // ❌ 每次渲染都创建新对象
   <Context.Provider value={{ user, setUser }}>
   
   // ✅ 缓存对象引用
   const value = useMemo(() => ({ user, setUser }), [user]);
   ```

4. **不要暴露 Context 对象**
   ```jsx
   // ❌ 暴露 Context
   export const UserContext = createContext();
   
   // ✅ 只暴露 Hook
   export function useUser() { ... }
   ```

5. **不要在渲染中创建 Context**
   ```jsx
   // ❌ 每次渲染都创建新 Context
   function Component() {
     const MyContext = createContext();
   }
   
   // ✅ 在模块作用域创建
   const MyContext = createContext();
   function Component() { ... }
   ```

---

## 15. 进阶话题

### 1. Context 的选择性订阅

**问题：** Context 更新时，所有消费者都会重渲染，即使只用了部分数据。

**解决方案：** 使用 `use-context-selector` 库

```jsx
// npm install use-context-selector

import { createContext, useContextSelector } from 'use-context-selector';

const UserContext = createContext();

function Component() {
  // 只订阅 name 字段
  const name = useContextSelector(UserContext, state => state.name);
  // age 变化时不会重渲染！
}
```

---

### 2. Context + useReducer

对于复杂状态逻辑，结合 useReducer 使用：

```jsx
// contexts/TodoContext.jsx

const TodoContext = createContext();

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(todo => todo.id !== action.payload);
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}

export function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within TodoProvider');
  return context;
}
```

**使用：**

```jsx
function TodoList() {
  const { todos, dispatch } = useTodos();
  
  const addTodo = (text) => {
    dispatch({ type: 'ADD', payload: { id: Date.now(), text, completed: false } });
  };
  
  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE', payload: id });
  };
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.completed ? '✅' : '⬜'} {todo.text}
        </div>
      ))}
    </div>
  );
}
```

---

### 3. Context 组合模式

**场景：** 需要同时使用多个 Context

```jsx
// hooks/useAppContext.js

export function useAppContext() {
  const user = useUser();
  const theme = useTheme();
  const language = useLanguage();
  
  return { user, theme, language };
}

// 使用
function Component() {
  const { user, theme, language } = useAppContext();
  // 一次获取所有需要的 Context
}
```

---

### 4. Context 的测试

```jsx
// contexts/__tests__/UserContext.test.jsx

import { render, screen } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';

function TestComponent() {
  const { user } = useUser();
  return <div>{user?.name}</div>;
}

test('provides user data', () => {
  render(
    <UserProvider>
      <TestComponent />
    </UserProvider>
  );
  
  expect(screen.getByText('HuXn')).toBeInTheDocument();
});

test('throws error when used outside Provider', () => {
  // 测试错误检查
  expect(() => {
    render(<TestComponent />);
  }).toThrow('useUser must be used within UserProvider');
});
```

---

### 5. TypeScript 中的 Context

```typescript
// contexts/UserContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. 定义类型
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. 创建 Context（类型安全）
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3. Provider
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    // 登录逻辑
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 4. 自定义 Hook（类型安全）
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

---

## 🎯 总结

### Context 的核心思想

1. **解决 Prop Drilling**：跨层级传递数据
2. **三个步骤**：createContext → Provider → useContext
3. **不是状态管理**：只是传递工具，需要配合 useState/useReducer
4. **性能优化**：useMemo、拆分 Context、状态分离

### 记住这些关键点

- ✅ Context = 传递渠道，不是状态本身
- ✅ 优先使用 useContext Hook，不用 Consumer
- ✅ 创建自定义 Provider 封装逻辑
- ✅ 使用 useMemo 优化性能
- ✅ 按职责拆分 Context
- ✅ 提供默认值和错误检查

### 何时使用 Context

**✅ 适合：**
- 主题配置
- 用户认证
- 语言/国际化
- 全局通知
- 应用配置

**❌ 不适合：**
- 频繁变化的数据
- 复杂状态管理（用 Redux/Zustand）
- 只在少数组件间共享（用 props）

### 下一步学习

1. ✅ 掌握 Context 基础（你已经完成！）
2. 🔄 实践自定义 Provider 模式
3. ⏭️ 学习 Context + useReducer
4. ⏭️ 对比学习 Redux/Zustand
5. ⏭️ 理解 React 18 并发特性对 Context 的影响

---

## 📚 参考资源

- [React 官方文档 - Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React 官方文档 - useContext](https://react.dev/reference/react/useContext)
- [React 官方文档 - Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [Kent C. Dodds - How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [use-context-selector](https://github.com/dai-shi/use-context-selector)

---

> **最后的建议：** Context 是强大的工具，但不要过度使用。记住：简单的问题用简单的方案（props），复杂的问题才考虑 Context 或状态管理库。保持代码简洁、可维护，这比使用"高级"特性更重要。

