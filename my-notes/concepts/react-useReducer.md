## useReducer 全面笔记（含原理、实践、对比、调试与 TS）

### 1. 【理解需求】
useReducer 是 React 提供的状态管理 Hook，适合管理「多字段、复杂更新逻辑」或「动作驱动（action-driven）」的状态变更。它返回 `[state, dispatch]`，通过 `dispatch(action)` 触发纯函数 `reducer(state, action)` 计算出新状态。

为什么不是一律用 useState？因为当更新逻辑变复杂、分支变多、状态彼此关联时，一个集中、可测试、可推导的 reducer 更有利于维护和演化。

### 2. 【引导思考】
- 你当前的状态更新逻辑是分散在多个 `setState` 里，还是可以抽象成“事件/动作 → 状态转移”？
- 你的状态是否存在多个字段的联动？是否容易产生“部分忘记更新”的隐性 bug？
- 未来功能会扩展吗？若新增动作类型（action），现在的设计是否便于扩展与测试？

### 3. 【讲解原理】
- **纯函数 reducer**：`(state, action) => newState`，不可产生副作用（I/O、异步、订阅等）。这样有助于可预测性和可测试性。
- **不可变更新**：返回一个新的 state 引用（而非原地修改），保障 React 通过引用变化判断需要重渲染。
- **动作驱动**：组件通过 `dispatch({ type, payload })` 表达“发生了什么”，reducer 决定“状态如何转移”。
- **懒初始化**：`useReducer(reducer, initialArg, init)` 可用 `init(initialArg)` 实现昂贵初始计算的惰性执行，或从本地存储恢复初始状态。

### 4. 【从示例出发】引用你项目中的最小示例
下面两段来自你的 `App.jsx`，演示基础用法：

```15:30:02. React Hooks/5. useReducer/live coding/App.jsx
import { useReducer } from "react";

const Counter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <h1>{state.count}</h1>
    </div>
  );
};
```

```32:57:02. React Hooks/5. useReducer/live coding/App.jsx
const initialState = { count: 0 };

const reducer = (state, action) => {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, count: state.count - 1 };
    case "reset":
      return { ...state, count: 0 };
    default:
      return state;
  }
};
```

思考：
- 为什么 reducer 里必须返回新对象（`{ ...state, ... }`）而不是 `state.count++`？
- `dispatch` 是否稳定可复用？（是的，React 保证 `dispatch` 引用稳定）
- 如果要加“加 5”这种参数化动作，如何扩展 action 结构更健壮？

### 5. 【展示方案】2-3 种常见设计与权衡

- 方案 A：继续使用 useState（适合简单、低耦合的独立字段）
  - 优点：上手简单、样板代码最少
  - 缺点：逻辑分散，多个字段联动时容易遗漏或相互冲突

- 方案 B：useReducer（适合复杂状态与清晰的动作语义）
  - 优点：集中管理、可测试性强、易扩展；动作语义清晰
  - 缺点：样板略多；初学者需要适应 action/reducer 思维

- 方案 C：useReducer + Context（适合中等规模的“全局”或“跨树”共享状态）
  - 优点：避免多层级 props drilling；与 useReducer 天然契合
  - 缺点：注意避免 Context 过度重渲染；需切分 context/selector

### 6. 【实践建议】生产级最佳实践清单
- 定义严格的 Action 联合类型（TS）或明确的 `type` 常量（JS），避免“字符串拼写错误”。
- reducer 必须纯：副作用放到组件或自定义 Hook 中（如 `useEffect`），或封装成 service 调用后 `dispatch` 结果。
- 用不可变更新，必要时引入 `immer` 简化深层更新。
- 使用 `init` 做惰性初始化（如从 `localStorage` 恢复）避免初次渲染的昂贵计算。
- 将复杂 reducer 拆分为小 reducer 并按模块组合（手动组合或在顶层协调）。
- 对外暴露语义化的 dispatch 辅助函数，避免在视图层拼装 action。
- 对未知 `action.type` 直接抛错（开发期）提升可维护性。

### 7. API 速查与懒初始化
```js
// 标准签名
const [state, dispatch] = useReducer(reducer, initialArg, init);

// 懒初始化：仅首渲染调用 init(initialArg)
function init(initialArg) {
  // 例如从本地存储恢复
  const saved = window.localStorage.getItem('counter');
  return saved ? JSON.parse(saved) : initialArg;
}
```

### 8. 动作设计与不可变更新（好 vs 坏）
```js
// ❌ 坏：在视图层随意构造 action，reducer 里还混入副作用
dispatch({ type: 'INC_BY', payload: 5, time: Date.now() });

// ✅ 好：用语义化辅助函数与不可变更新
const incrementBy = (value) => ({ type: 'INC_BY', payload: { value } });
dispatch(incrementBy(5));
```

```js
// ❌ 坏：直接修改原 state，引用未变
state.count++;
return state;

// ✅ 好：返回新引用
return { ...state, count: state.count + action.payload.value };
```

### 9. 与 Context 集成（中等规模共享状态）
```jsx
// UserProvider.jsx —— 将 useReducer 与 Context 结合
import { createContext, useContext, useReducer } from 'react';

const UserStateContext = createContext(null);
const UserDispatchContext = createContext(null);

const initialState = { user: null, loading: false, error: null };

function userReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload.user };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  return (
    <UserDispatchContext.Provider value={dispatch}>
      <UserStateContext.Provider value={state}>{children}</UserStateContext.Provider>
    </UserDispatchContext.Provider>
  );
}

export const useUserState = () => useContext(UserStateContext);
export const useUserDispatch = () => useContext(UserDispatchContext);
```

### 10. 异步动作模式（请求三连：loading/success/error）
```jsx
// 在组件或自定义 hook 发起异步，再分派同步 action
function useLogin() {
  const dispatch = useUserDispatch();
  return async (credentials) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const user = await api.login(credentials); // 调用服务层
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: err.message } });
    }
  };
}
```

### 11. 使用 init 做本地持久化（惰性初始化 + 监听持久化）
```jsx
function init(initialArg) {
  const raw = localStorage.getItem('counter');
  return raw ? JSON.parse(raw) : initialArg;
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 }, init);

  // 持久化副作用放在 useEffect 中
  useEffect(() => {
    localStorage.setItem('counter', JSON.stringify(state));
  }, [state]);

  // ... render
}
```

### 12. 性能与重渲染
- `dispatch` 引用稳定，可直接下传；但 `state` 的变化会触发使用它的组件重渲染。
- 若 Context + useReducer：可拆分 State/Dispatch 上下文，或在消费端使用选择器与 `useMemo`/`useCallback` 进行优化。
- 避免在 JSX 中构造临时对象作为 props（可封装 action creator 或 memo 化）。

### 13. TypeScript 模式（强类型 action 与 state）
```ts
type State = { count: number };
type Increment = { type: 'INCREMENT' };
type Decrement = { type: 'DECREMENT' };
type Add = { type: 'ADD'; payload: { value: number } };
type Action = Increment | Decrement | Add;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'ADD':
      return { count: state.count + action.payload.value };
    default: {
      const _exhaustiveCheck: never = action;
      return state;
    }
  }
}
```

### 14. 常见错误模式识别（Debug 思维）
- 直接修改 state（引用未变，React 可能不重渲）→ 使用不可变更新。
- 在 reducer 中写副作用（异步/日志/订阅）→ 移到 `useEffect` 或 action creator。
- action.type 拼写错误 → 定义常量或 TS 联合类型；对 default 分支抛错（开发期）。
- 复杂 reducer 嵌套层级深 → 拆分 reducer 或用 `immer`。

### 15. 测试与可维护性
- reducer 为纯函数，天然易测：构造 `state` 与 `action`，断言 `newState`。
- 规约动作命名：动词 + 领域对象（如 `CART_ITEM_ADDED`）。
- 约束对外暴露：视图层仅调用语义化的 action creator，避免散落魔法字符串。

### 16. 与 useState/外部状态库的比较
- useState：更简单、粒度细；适合本地且简单的状态。
- useReducer：动作驱动、集中逻辑；适合复杂/关联状态与清晰的更新语义。
- 外部库（Redux/Zustand/Jotai）：跨页面复杂共享、时间旅行、生态中间件；成本更高，适用于更大规模。

### 17. 扩展阅读
- React 官方文档：`https://react.dev/reference/react/useReducer`
- Reducer 与不可变数据：`https://immerjs.github.io/immer/`
- Context 性能优化讨论：`https://react.dev/learn/scaling-up-with-reducer-and-context`

### 18. 【验证理解】小练习
实现一个 Todo 管理：
- 动作：`ADD_TODO`, `TOGGLE_TODO`, `REMOVE_TODO`, `CLEAR_COMPLETED`；
- 使用 `init` 从 `localStorage` 恢复；
- 将 `dispatch` 与 `state` 分离到两个 Context；
- 在组件中实现“新增/切换/删除/清空已完成”，并保证不可变更新。

完成后，自测要点：
- reducer 无副作用；
- 对未知 action 抛错（开发期）；
- 本地持久化仅在 `useEffect`；
- 增删改查均有单元测试验证。


