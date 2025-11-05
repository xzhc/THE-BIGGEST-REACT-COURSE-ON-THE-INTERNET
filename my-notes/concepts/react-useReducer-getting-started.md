# useReducer 新手入门：从痛点到精通的渐进之路

> 💡 **学习理念**：不要一开始就背概念，而是从实际问题出发，体会"为什么需要 useReducer"

---

## 目录
1. [你会遇到的痛点](#1-你会遇到的痛点)
2. [useReducer 是什么？用生活类比理解](#2-usereducer-是什么用生活类比理解)
3. [案例 1：简单计数器 - 感受基础用法](#案例-1简单计数器---感受基础用法)
4. [案例 2：带历史记录的计数器 - 体会集中管理的优势](#案例-2带历史记录的计数器---体会集中管理的优势)
5. [案例 3：登录表单 - 多字段联动](#案例-3登录表单---多字段联动)
6. [案例 4：Todo List - 增删改查完整流程](#案例-4todo-list---增删改查完整流程)
7. [案例 5：购物车 - 真实业务场景](#案例-5购物车---真实业务场景)
8. [何时使用 useReducer vs useState](#何时使用-usereducer-vs-usestate)
9. [新手常见错误与避坑指南](#新手常见错误与避坑指南)
10. [下一步学习方向](#下一步学习方向)

---

## 1. 你会遇到的痛点

### 场景 A：多个相关状态难以同步

```jsx
// ❌ 你可能会写出这样的代码
function UserProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false); // 💀 容易忘记重置某个状态
    
    try {
      await api.updateProfile({ name, email });
      setIsSuccess(true);
      setIsLoading(false); // 💀 顺序错了可能导致闪烁
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setIsSuccess(false); // 💀 又要记得重置
    }
  };
  
  // ... 还要到处检查这些状态的组合
}
```

**痛点**：
- 5 个 setState，很容易漏掉某个
- 状态之间有逻辑关系（loading 时不应该 success，error 时应该清空 success）
- 难以保证状态转换的"原子性"

---

### 场景 B：复杂的状态更新逻辑

```jsx
// ❌ 逻辑分散，难以维护
function ShoppingCart() {
  const [items, setItems] = useState([]);
  
  const addItem = (product) => {
    const existing = items.find(item => item.id === product.id);
    if (existing) {
      setItems(items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };
  
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id); // 💀 调用了另一个函数，逻辑耦合
    } else {
      setItems(items.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };
  
  // 💀 想测试这些函数？抱歉，它们依赖组件状态，难以单独测试
}
```

**痛点**：
- 更新逻辑散落在各个事件处理函数中
- 函数之间互相调用，耦合严重
- 难以测试，难以复用
- 新增功能时要到处改

---

## 2. useReducer 是什么？用生活类比理解

### 生活类比：银行柜台 vs 自助取款机

**useState 就像自助取款机**：
- 你想取钱？直接 `setMoney(money - 100)`
- 简单直接，适合简单操作

**useReducer 就像银行柜台**：
- 你递给柜员一张"业务单"（action）：`{ type: "取款", amount: 100 }`
- 柜员（reducer）根据业务单类型执行标准流程
- 好处：
  - ✅ 所有业务逻辑在柜台统一处理（集中）
  - ✅ 流程标准化，不会遗漏步骤（可靠）
  - ✅ 可以记录所有业务单（可追溯）
  - ✅ 培训新柜员时只需要教会流程（可维护）

### 核心概念（3 分钟理解）

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

**三个关键角色**：

1. **state（当前状态）**：就像你的账户余额
2. **dispatch（派发动作）**：就像你递交业务单
3. **reducer（处理函数）**：就像柜员的操作手册

**工作流程**：
```
你点击按钮 
  → 派发动作 dispatch({ type: "存款", amount: 100 })
    → reducer 接收当前状态和动作，计算新状态
      → React 更新状态，触发重新渲染
```

---

## 案例 1：简单计数器 - 感受基础用法

### 【为什么从这个开始】

这是最简单的例子，让你理解 useReducer 的基本结构，不涉及复杂逻辑。

### 【对比：useState vs useReducer】

```jsx
// 方式 A：使用 useState（适合这个简单场景）
function CounterWithState() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <h1>{count}</h1>
    </div>
  );
}
```

```jsx
// 方式 B：使用 useReducer（展示结构，实际有点杀鸡用牛刀）
import { useReducer } from 'react';

// 1️⃣ 定义初始状态
const initialState = { count: 0 };

// 2️⃣ 定义 reducer：根据动作类型返回新状态
function reducer(state, action) {
  // 💡 思考：为什么这里用 switch？能不能用 if-else？
  switch (action.type) {
    case 'increment':
      // ✅ 返回新对象，不直接修改 state
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      // 💡 未知动作直接返回原状态（不报错）
      // 💡 生产环境可以抛出错误，帮助发现 bug
      return state;
  }
}

// 3️⃣ 在组件中使用
function CounterWithReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      {/* 💡 注意：dispatch 的参数是一个"动作对象" */}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <h1>{state.count}</h1>
    </div>
  );
}
```

### 【代码拆解：每一步都在做什么】

```jsx
// 步骤 1️⃣：用户点击 "+" 按钮
onClick={() => dispatch({ type: 'increment' })}

// 步骤 2️⃣：dispatch 把动作传给 reducer
reducer(
  { count: 0 },              // 当前 state
  { type: 'increment' }      // 你传入的 action
)

// 步骤 3️⃣：reducer 执行，返回新状态
return { count: 1 }

// 步骤 4️⃣：React 发现状态变了，重新渲染组件
<h1>{state.count}</h1>  // 显示 1
```

### 【思考题】

1. **为什么要返回新对象 `{ count: state.count + 1 }` 而不是 `state.count++`？**
   <details>
   <summary>点击查看答案</summary>
   
   因为 React 通过"引用比较"判断状态是否变化：
   ```jsx
   // ❌ 错误：直接修改，引用没变，React 不会重新渲染
   state.count++;
   return state;  // 还是原来的对象引用
   
   // ✅ 正确：返回新对象，引用变了，React 知道要更新
   return { count: state.count + 1 };  // 新对象
   ```
   </details>

2. **dispatch 的参数一定要叫 `type` 吗？**
   <details>
   <summary>点击查看答案</summary>
   
   不一定，你可以用任何结构，但 `{ type: '...', payload: ... }` 是社区约定：
   ```jsx
   // ✅ 标准写法
   dispatch({ type: 'add', payload: { value: 5 } })
   
   // ✅ 也可以这样（但不推荐）
   dispatch({ action: 'add', data: 5 })
   
   // 关键是 reducer 能识别就行
   ```
   </details>

3. **为什么 reducer 要定义在组件外面？**
   <details>
   <summary>点击查看答案</summary>
   
   - 纯函数不依赖外部变量，放外面更清晰
   - 避免每次渲染都重新创建函数（性能优化）
   - 方便测试：可以单独导出测试
   ```jsx
   // ✅ 可以单独测试
   expect(reducer({ count: 0 }, { type: 'increment' }))
     .toEqual({ count: 1 });
   ```
   </details>

---

## 案例 2：带历史记录的计数器 - 体会集中管理的优势

### 【需求】

现在要加一个"撤销"功能，记录每次操作的历史。

### 【用 useState 实现（会很痛苦）】

```jsx
// ❌ 代码变得复杂且容易出错
function CounterWithHistory() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    // 💀 要记得同时更新历史
    setHistory([...history.slice(0, historyIndex + 1), newCount]);
    setHistoryIndex(historyIndex + 1);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCount(history[historyIndex - 1]);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCount(history[historyIndex + 1]);
    }
  };
  
  // 💀 三个状态要保持同步，容易出 bug
}
```

### 【用 useReducer 实现（清晰优雅）】

```jsx
// ✅ 所有逻辑集中在 reducer，不会忘记更新某个字段
const initialState = {
  count: 0,
  history: [0],
  historyIndex: 0
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment': {
      const newCount = state.count + 1;
      // ✅ 一次性更新所有相关状态，保证一致性
      return {
        count: newCount,
        history: [...state.history.slice(0, state.historyIndex + 1), newCount],
        historyIndex: state.historyIndex + 1
      };
    }
    
    case 'decrement': {
      const newCount = state.count - 1;
      return {
        count: newCount,
        history: [...state.history.slice(0, state.historyIndex + 1), newCount],
        historyIndex: state.historyIndex + 1
      };
    }
    
    case 'undo': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          count: state.history[newIndex],
          historyIndex: newIndex
        };
      }
      return state; // 💡 无法撤销时返回原状态
    }
    
    case 'redo': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          count: state.history[newIndex],
          historyIndex: newIndex
        };
      }
      return state;
    }
    
    case 'reset': {
      return initialState; // 💡 直接返回初始状态
    }
    
    default:
      return state;
  }
}

function CounterWithHistory() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <h1>{state.count}</h1>
      
      <div>
        <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
        <button onClick={() => dispatch({ type: 'increment' })}>+</button>
        <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      </div>
      
      <div>
        <button 
          onClick={() => dispatch({ type: 'undo' })}
          disabled={state.historyIndex === 0}
        >
          ↶ 撤销
        </button>
        <button 
          onClick={() => dispatch({ type: 'redo' })}
          disabled={state.historyIndex === state.history.length - 1}
        >
          ↷ 重做
        </button>
      </div>
      
      <div>
        <small>历史记录：{state.history.join(' → ')}</small>
      </div>
    </div>
  );
}
```

### 【对比总结】

| 方面 | useState | useReducer |
|------|----------|------------|
| **状态数量** | 3 个独立的 state | 1 个统一的 state 对象 |
| **更新逻辑** | 分散在各个函数中 | 集中在 reducer 中 |
| **一致性保证** | 手动保证，容易遗漏 | 一次返回，天然一致 |
| **测试难度** | 难：依赖组件环境 | 易：纯函数，传入参数即可 |
| **新增功能** | 要改多个地方 | 只需加一个 case |

### 【思考题】

1. **能否在 increment 的 case 中调用 decrement 的逻辑？**
   <details>
   <summary>点击查看答案</summary>
   
   不推荐！每个 case 应该独立完整：
   ```jsx
   // ❌ 不推荐：case 之间互相调用
   case 'increment':
     return reducer(state, { type: 'decrement' });
   
   // ✅ 推荐：提取公共逻辑
   function addToHistory(state, newCount) {
     return {
       count: newCount,
       history: [...state.history.slice(0, state.historyIndex + 1), newCount],
       historyIndex: state.historyIndex + 1
     };
   }
   
   case 'increment':
     return addToHistory(state, state.count + 1);
   ```
   </details>

---

## 案例 3：登录表单 - 多字段联动

### 【场景描述】

一个登录表单，需要管理：
- 用户输入（username, password）
- 验证状态（是否为空、格式是否正确）
- 提交状态（loading, error, success）

### 【useState 的痛苦】

```jsx
// ❌ 状态爆炸，难以维护
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 💀 每个输入框都要处理验证
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(value.length < 3 ? '用户名至少 3 个字符' : '');
    setSubmitError(null); // 💀 要记得清空全局错误
  };
  
  const handleSubmit = async () => {
    // 💀 提交前要重置一堆状态
    setIsLoading(true);
    setSubmitError(null);
    setIsSuccess(false);
    
    try {
      await login(username, password);
      // 💀 成功后又要更新多个状态
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      // 💀 失败后也要更新多个状态
      setIsLoading(false);
      setSubmitError(err.message);
    }
  };
  
  // ... 组件渲染
}
```

### 【useReducer 优雅解决】

```jsx
// ✅ 状态结构清晰
const initialState = {
  // 表单数据
  fields: {
    username: '',
    password: ''
  },
  // 字段级错误
  fieldErrors: {
    username: '',
    password: ''
  },
  // 提交状态
  submitStatus: {
    isLoading: false,
    error: null,
    isSuccess: false
  }
};

function loginReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE': {
      const { field, value } = action.payload;
      
      // 💡 同时更新字段值和验证错误
      let error = '';
      if (field === 'username' && value.length < 3) {
        error = '用户名至少 3 个字符';
      }
      if (field === 'password' && value.length < 6) {
        error = '密码至少 6 个字符';
      }
      
      return {
        ...state,
        fields: {
          ...state.fields,
          [field]: value  // 💡 动态属性名
        },
        fieldErrors: {
          ...state.fieldErrors,
          [field]: error
        },
        // 💡 清空提交错误（用户修改了输入）
        submitStatus: {
          ...state.submitStatus,
          error: null
        }
      };
    }
    
    case 'SUBMIT_START': {
      // 💡 一次性设置所有提交相关状态
      return {
        ...state,
        submitStatus: {
          isLoading: true,
          error: null,
          isSuccess: false
        }
      };
    }
    
    case 'SUBMIT_SUCCESS': {
      return {
        ...state,
        submitStatus: {
          isLoading: false,
          error: null,
          isSuccess: true
        }
      };
    }
    
    case 'SUBMIT_ERROR': {
      return {
        ...state,
        submitStatus: {
          isLoading: false,
          error: action.payload.error,
          isSuccess: false
        }
      };
    }
    
    case 'RESET_FORM': {
      return initialState; // 💡 重置表单
    }
    
    default:
      return state;
  }
}

function LoginForm() {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  
  // ✅ 事件处理函数变得简洁
  const handleChange = (field) => (e) => {
    dispatch({
      type: 'FIELD_CHANGE',
      payload: { field, value: e.target.value }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 💡 先检查字段错误
    const hasErrors = Object.values(state.fieldErrors).some(err => err !== '');
    if (hasErrors) return;
    
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await login(state.fields.username, state.fields.password);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ 
        type: 'SUBMIT_ERROR', 
        payload: { error: err.message } 
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 用户名 */}
      <div>
        <input
          type="text"
          value={state.fields.username}
          onChange={handleChange('username')}
          placeholder="用户名"
        />
        {state.fieldErrors.username && (
          <span className="error">{state.fieldErrors.username}</span>
        )}
      </div>
      
      {/* 密码 */}
      <div>
        <input
          type="password"
          value={state.fields.password}
          onChange={handleChange('password')}
          placeholder="密码"
        />
        {state.fieldErrors.password && (
          <span className="error">{state.fieldErrors.password}</span>
        )}
      </div>
      
      {/* 提交按钮 */}
      <button 
        type="submit"
        disabled={state.submitStatus.isLoading}
      >
        {state.submitStatus.isLoading ? '登录中...' : '登录'}
      </button>
      
      {/* 全局错误提示 */}
      {state.submitStatus.error && (
        <div className="error">{state.submitStatus.error}</div>
      )}
      
      {/* 成功提示 */}
      {state.submitStatus.isSuccess && (
        <div className="success">登录成功！</div>
      )}
    </form>
  );
}
```

### 【关键技巧】

1. **状态分层组织**
   ```jsx
   {
     fields: { ... },        // 数据层
     fieldErrors: { ... },   // 验证层
     submitStatus: { ... }   // UI 状态层
   }
   ```

2. **动态字段更新**
   ```jsx
   [field]: value  // 相当于 username: value 或 password: value
   ```

3. **联动更新**
   ```jsx
   // 用户修改输入时，同时：
   // ✅ 更新字段值
   // ✅ 更新字段错误
   // ✅ 清空全局错误
   ```

### 【思考题】

1. **为什么要把 `handleChange` 写成高阶函数？**
   <details>
   <summary>点击查看答案</summary>
   
   ```jsx
   // 方式 A：每个字段写一个函数（重复代码）
   const handleUsernameChange = (e) => {
     dispatch({ type: 'FIELD_CHANGE', payload: { field: 'username', value: e.target.value }});
   };
   const handlePasswordChange = (e) => { /* 同上 */ };
   
   // 方式 B：高阶函数（复用逻辑）
   const handleChange = (field) => (e) => {
     dispatch({ type: 'FIELD_CHANGE', payload: { field, value: e.target.value }});
   };
   
   // 使用时
   onChange={handleChange('username')}
   onChange={handleChange('password')}
   ```
   </details>

---

## 案例 4：Todo List - 增删改查完整流程

### 【需求】

实现一个功能完整的 Todo 应用：
- ✅ 添加任务
- ✅ 删除任务
- ✅ 切换完成状态
- ✅ 编辑任务
- ✅ 过滤显示（全部/未完成/已完成）
- ✅ 清空已完成
- ✅ 统计信息

### 【完整实现】

```jsx
import { useReducer, useState } from 'react';

// ========== 类型定义（用注释表示，实际开发建议用 TypeScript）==========
// Todo: { id: number, text: string, completed: boolean }
// Filter: 'all' | 'active' | 'completed'

// ========== 初始状态 ==========
const initialState = {
  todos: [],
  filter: 'all',  // 当前过滤器
  nextId: 1       // 用于生成唯一 ID
};

// ========== Reducer ==========
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodo = {
        id: state.nextId,
        text: action.payload.text,
        completed: false
      };
      
      return {
        ...state,
        todos: [...state.todos, newTodo],
        nextId: state.nextId + 1
      };
    }
    
    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    }
    
    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };
    }
    
    case 'EDIT_TODO': {
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        )
      };
    }
    
    case 'CLEAR_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
    }
    
    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload.filter
      };
    }
    
    case 'TOGGLE_ALL': {
      // 💡 如果全部已完成，则取消全部；否则完成全部
      const allCompleted = state.todos.every(todo => todo.completed);
      return {
        ...state,
        todos: state.todos.map(todo => ({
          ...todo,
          completed: !allCompleted
        }))
      };
    }
    
    default:
      return state;
  }
}

// ========== 选择器（Selectors）==========
// 💡 从 state 中派生数据，避免重复逻辑
function getFilteredTodos(todos, filter) {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

function getTodoStats(todos) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  
  return { total, completed, active };
}

// ========== 组件 ==========
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // 派生数据
  const filteredTodos = getFilteredTodos(state.todos, state.filter);
  const stats = getTodoStats(state.todos);
  
  // ========== 事件处理 ==========
  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    dispatch({ type: 'ADD_TODO', payload: { text: inputValue } });
    setInputValue('');
  };
  
  const handleToggle = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };
  
  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  };
  
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  
  const saveEdit = (id) => {
    if (editText.trim() === '') {
      handleDelete(id); // 💡 空内容则删除
    } else {
      dispatch({ type: 'EDIT_TODO', payload: { id, text: editText } });
    }
    setEditingId(null);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };
  
  // ========== 渲染 ==========
  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      
      {/* 添加表单 */}
      <form onSubmit={handleAdd}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>
      
      {/* 统计信息 */}
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Active: {stats.active}</span>
        <span>Completed: {stats.completed}</span>
      </div>
      
      {/* 过滤器 */}
      <div className="filters">
        <button
          className={state.filter === 'all' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: { filter: 'all' } })}
        >
          All
        </button>
        <button
          className={state.filter === 'active' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: { filter: 'active' } })}
        >
          Active
        </button>
        <button
          className={state.filter === 'completed' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: { filter: 'completed' } })}
        >
          Completed
        </button>
      </div>
      
      {/* 批量操作 */}
      {state.todos.length > 0 && (
        <div className="bulk-actions">
          <button onClick={() => dispatch({ type: 'TOGGLE_ALL' })}>
            Toggle All
          </button>
          {stats.completed > 0 && (
            <button onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>
              Clear Completed ({stats.completed})
            </button>
          )}
        </div>
      )}
      
      {/* Todo 列表 */}
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {editingId === todo.id ? (
              // 编辑模式
              <div className="edit-mode">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  autoFocus
                />
                <button onClick={() => saveEdit(todo.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              // 显示模式
              <div className="view-mode">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                />
                <span onDoubleClick={() => startEdit(todo)}>
                  {todo.text}
                </span>
                <button onClick={() => handleDelete(todo.id)}>×</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      {/* 空状态 */}
      {filteredTodos.length === 0 && (
        <div className="empty-state">
          {state.filter === 'all' 
            ? 'No todos yet. Add one above!'
            : `No ${state.filter} todos.`
          }
        </div>
      )}
    </div>
  );
}

export default TodoApp;
```

### 【代码亮点】

1. **状态最小化**
   ```jsx
   ❌ 不要存储派生数据
   {
     todos: [...],
     filteredTodos: [...]  // 可以从 todos 计算出来
   }
   
   ✅ 只存储必要数据
   {
     todos: [...],
     filter: 'all'  // 通过函数动态计算 filteredTodos
   }
   ```

2. **选择器模式（Selectors）**
   ```jsx
   // ✅ 把计算逻辑提取为纯函数
   function getFilteredTodos(todos, filter) {
     // 可以复用、可以测试、可以优化（memo）
   }
   ```

3. **Action 命名约定**
   ```jsx
   // ✅ 使用大写 + 下划线，清晰表达意图
   'ADD_TODO'       // 添加
   'TOGGLE_TODO'    // 切换
   'DELETE_TODO'    // 删除
   ```

4. **不可变更新模式**
   ```jsx
   // 💡 数组映射（保留其他项，修改目标项）
   todos: state.todos.map(todo =>
     todo.id === targetId
       ? { ...todo, completed: !todo.completed }  // 修改目标项
       : todo                                      // 保留其他项
   )
   ```

### 【思考题】

1. **为什么要单独维护 `nextId` 而不是用 `todos.length`？**
   <details>
   <summary>点击查看答案</summary>
   
   ```jsx
   // ❌ 用 length 会导致 ID 重复
   添加 todo1 (id: 0)
   添加 todo2 (id: 1)
   删除 todo1
   添加 todo3 (id: 1)  // 💀 重复了！
   
   // ✅ 单独维护 nextId，始终递增
   添加 todo1 (id: 1, nextId++)
   添加 todo2 (id: 2, nextId++)
   删除 todo1
   添加 todo3 (id: 3, nextId++)  // ✅ 唯一
   ```
   </details>

2. **能否把编辑状态也放进 reducer？**
   <details>
   <summary>点击查看答案</summary>
   
   可以，但没必要：
   ```jsx
   // 方案 A：放在 reducer（过度设计）
   const initialState = {
     todos: [],
     editingId: null,
     editText: ''
   };
   
   // 方案 B：用 useState（更合理）
   const [editingId, setEditingId] = useState(null);
   
   // 💡 判断标准：这个状态只在当前组件用吗？
   // 如果是 → useState
   // 如果需要在多个地方共享 → useReducer/Context
   ```
   </details>

---

## 案例 5：购物车 - 真实业务场景

### 【需求】

实现一个电商购物车：
- 添加商品到购物车
- 修改商品数量
- 删除商品
- 应用优惠券
- 计算总价（含优惠）

### 【完整实现】

```jsx
import { useReducer } from 'react';

// ========== 初始状态 ==========
const initialState = {
  items: [],  // { id, name, price, quantity, image }
  coupon: null,  // { code, discount: 0.1 } 表示 10% 折扣
  appliedCoupon: null
};

// ========== Reducer ==========
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product } = action.payload;
      
      // 💡 检查是否已存在
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // 已存在，数量 +1
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        };
        return { ...state, items: newItems };
      } else {
        // 不存在，新增
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        };
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      // 💡 数量为 0 则删除
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? { ...item, quantity }
            : item
        )
      };
    }
    
    case 'APPLY_COUPON': {
      const { code } = action.payload;
      
      // 💡 实际项目中应该调用 API 验证优惠券
      // 这里简化为本地验证
      const validCoupons = {
        'SAVE10': { discount: 0.1, description: '9折优惠' },
        'SAVE20': { discount: 0.2, description: '8折优惠' }
      };
      
      const coupon = validCoupons[code];
      
      if (coupon) {
        return {
          ...state,
          appliedCoupon: { code, ...coupon }
        };
      } else {
        return state; // 💡 无效优惠券，不改变状态
      }
    }
    
    case 'REMOVE_COUPON': {
      return {
        ...state,
        appliedCoupon: null
      };
    }
    
    case 'CLEAR_CART': {
      return initialState;
    }
    
    default:
      return state;
  }
}

// ========== 选择器：计算总价 ==========
function getCartSummary(items, appliedCoupon) {
  // 小计（商品总价）
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // 折扣金额
  const discountAmount = appliedCoupon 
    ? subtotal * appliedCoupon.discount 
    : 0;
  
  // 最终总价
  const total = subtotal - discountAmount;
  
  // 商品总数
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    subtotal,
    discountAmount,
    total,
    totalItems
  };
}

// ========== 组件 ==========
function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const summary = getCartSummary(state.items, state.appliedCoupon);
  
  // ========== 事件处理 ==========
  const handleAddItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: { product } });
  };
  
  const handleRemoveItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const handleUpdateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const handleApplyCoupon = (code) => {
    dispatch({ type: 'APPLY_COUPON', payload: { code } });
  };
  
  // ========== 渲染 ==========
  return (
    <div className="shopping-cart">
      <h1>购物车 ({summary.totalItems} 件商品)</h1>
      
      {/* 商品列表 */}
      {state.items.length === 0 ? (
        <div className="empty-cart">
          <p>购物车是空的</p>
          <button onClick={() => handleAddItem({
            id: 1,
            name: '示例商品',
            price: 99.99,
            image: '🎁'
          })}>
            添加示例商品
          </button>
        </div>
      ) : (
        <div className="cart-items">
          {state.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">{item.image}</div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">¥{item.price.toFixed(2)}</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <div className="item-total">
                ¥{(item.price * item.quantity).toFixed(2)}
              </div>
              <button 
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* 优惠券 */}
      <div className="coupon-section">
        <h3>优惠券</h3>
        {state.appliedCoupon ? (
          <div className="applied-coupon">
            <span>{state.appliedCoupon.code} - {state.appliedCoupon.description}</span>
            <button onClick={() => dispatch({ type: 'REMOVE_COUPON' })}>
              移除
            </button>
          </div>
        ) : (
          <div className="coupon-input">
            <input
              type="text"
              placeholder="输入优惠券代码"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCoupon(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button onClick={(e) => {
              const input = e.target.previousElementSibling;
              handleApplyCoupon(input.value);
              input.value = '';
            }}>
              应用
            </button>
            <small>试试 SAVE10 或 SAVE20</small>
          </div>
        )}
      </div>
      
      {/* 价格汇总 */}
      <div className="cart-summary">
        <div className="summary-row">
          <span>小计：</span>
          <span>¥{summary.subtotal.toFixed(2)}</span>
        </div>
        
        {summary.discountAmount > 0 && (
          <div className="summary-row discount">
            <span>折扣：</span>
            <span>-¥{summary.discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row total">
          <span>总计：</span>
          <span>¥{summary.total.toFixed(2)}</span>
        </div>
        
        <button 
          className="checkout-btn"
          disabled={state.items.length === 0}
        >
          去结算
        </button>
        
        {state.items.length > 0 && (
          <button 
            className="clear-btn"
            onClick={() => dispatch({ type: 'CLEAR_CART' })}
          >
            清空购物车
          </button>
        )}
      </div>
    </div>
  );
}

export default ShoppingCart;
```

### 【业务逻辑亮点】

1. **智能添加商品**
   ```jsx
   // 💡 同一商品：数量 +1
   // 💡 新商品：添加到列表
   const existingIndex = state.items.findIndex(item => item.id === product.id);
   ```

2. **数量为 0 自动删除**
   ```jsx
   case 'UPDATE_QUANTITY': {
     if (quantity <= 0) {
       // 💡 不需要单独调用 REMOVE_ITEM
       return { ...state, items: state.items.filter(...) };
     }
   }
   ```

3. **价格计算分离**
   ```jsx
   // ✅ 用 selector 计算派生数据，不污染 state
   function getCartSummary(items, appliedCoupon) {
     // 可以轻松修改计算逻辑（如加运费）
   }
   ```

### 【思考题】

1. **如何支持"买二送一"这种复杂优惠？**
   <details>
   <summary>点击查看答案</summary>
   
   ```jsx
   function getCartSummary(items, appliedCoupon) {
     let subtotal = 0;
     
     items.forEach(item => {
       if (appliedCoupon?.type === 'BUY_2_GET_1') {
         // 💡 每 3 件只算 2 件的钱
         const paidQuantity = Math.floor(item.quantity / 3) * 2 
                             + (item.quantity % 3);
         subtotal += item.price * paidQuantity;
       } else {
         subtotal += item.price * item.quantity;
       }
     });
     
     return { subtotal, /* ... */ };
   }
   ```
   </details>

2. **优惠券验证应该在哪里做？**
   <details>
   <summary>点击查看答案</summary>
   
   ```jsx
   // ❌ 不要在 reducer 中调用 API（副作用）
   case 'APPLY_COUPON': {
     const result = await api.validateCoupon(code);  // 💀 不行！
   }
   
   // ✅ 在组件中异步验证，然后 dispatch 结果
   const handleApplyCoupon = async (code) => {
     dispatch({ type: 'COUPON_VALIDATING' });
     
     try {
       const coupon = await api.validateCoupon(code);
       dispatch({ type: 'COUPON_VALID', payload: { coupon } });
     } catch (err) {
       dispatch({ type: 'COUPON_INVALID', payload: { error: err.message } });
     }
   };
   ```
   </details>

---

## 何时使用 useReducer vs useState

### 决策树

```
你有多个相关的状态吗？
  ├─ 否 → 用 useState ✅
  └─ 是 ↓
      
      这些状态需要同时更新以保证一致性吗？
      ├─ 否 → 用多个 useState ✅
      └─ 是 ↓
      
          状态更新逻辑复杂吗（多个 if/else）？
          ├─ 否 → 用 useState + 自定义 Hook 封装 ✅
          └─ 是 ↓
          
              需要测试更新逻辑吗？
              ├─ 是 → 用 useReducer ✅✅✅
              └─ 否（但还是建议用） → useReducer ✅✅
```

### 对比表格

| 场景 | useState | useReducer |
|------|----------|------------|
| **简单计数器** | ✅ 完美 | ⚠️ 杀鸡用牛刀 |
| **表单（2-3个字段）** | ✅ 可以 | ⚠️ 略显繁琐 |
| **表单（5+ 字段）** | ⚠️ 代码分散 | ✅ 推荐 |
| **Todo List** | ⚠️ 难以维护 | ✅ 推荐 |
| **购物车** | ❌ 太复杂 | ✅✅ 强烈推荐 |
| **需要时间旅行** | ❌ 做不到 | ✅ 天然支持 |
| **需要单元测试** | ⚠️ 需要测试组件 | ✅ 测试纯函数即可 |

### 经验法则

```jsx
// ✅ 用 useState 如果：
const [count, setCount] = useState(0);  // 单一简单值
const [isOpen, setIsOpen] = useState(false);  // 布尔值

// ✅ 用 useReducer 如果：
// 1. 多个字段需要同时更新
// 2. 下次的状态依赖当前的多个状态
// 3. 更新逻辑可以抽象为"动作"
// 4. 需要单元测试状态转换逻辑
// 5. 状态更新有多个分支（>3 个 if/else）
```

---

## 新手常见错误与避坑指南

### 错误 1：直接修改 state ❌

```jsx
// ❌ 错误：引用没变，React 不会重新渲染
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      state.todos.push(action.payload);  // 💀 直接修改数组
      return state;  // 返回的还是同一个引用
  }
}

// ✅ 正确：返回新引用
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload]  // 新数组
      };
  }
}
```

**为什么？**
```jsx
// React 的更新检测
const oldState = { todos: [1, 2] };
const newState = oldState;
newState.todos.push(3);

console.log(oldState === newState);  // true
// React: "引用没变，不需要重新渲染" 💀
```

---

### 错误 2：在 reducer 中写副作用 ❌

```jsx
// ❌ 错误：reducer 不应该有副作用
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      console.log('Adding todo');  // 💀 日志是副作用
      localStorage.setItem('todos', JSON.stringify(state.todos));  // 💀 I/O 是副作用
      return { ...state, todos: [...state.todos, action.payload] };
  }
}

// ✅ 正确：副作用放在 useEffect
function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // ✅ 在 effect 中处理副作用
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
  }, [state.todos]);
  
  return (/* ... */);
}
```

**为什么？**
- Reducer 应该是**纯函数**：相同输入永远得到相同输出
- React 可能会多次调用 reducer（如 Strict Mode）
- 副作用难以测试、难以预测

---

### 错误 3：忘记处理 default case ❌

```jsx
// ❌ 错误：没有 default，拼写错误时会返回 undefined
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
  }
  // 💀 如果 action.type 是 'incremnet'（拼写错误），返回 undefined
}

// ✅ 正确：始终有 default
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      // 开发环境：抛出错误，帮助发现问题
      throw new Error(`Unknown action: ${action.type}`);
      
      // 或者：返回原状态（生产环境更安全）
      // return state;
  }
}
```

---

### 错误 4：过度使用 useReducer ❌

```jsx
// ❌ 杀鸡用牛刀：简单的布尔值不需要 reducer
const initialState = { isOpen: false };

function modalReducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return { isOpen: true };
    case 'CLOSE':
      return { isOpen: false };
    default:
      return state;
  }
}

function Modal() {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  // ... 使用 dispatch({ type: 'OPEN' })
}

// ✅ 简单场景用 useState
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  // ... 使用 setIsOpen(true)
}
```

**经验**：写 3 行以上的 reducer 再考虑 useReducer，否则 useState 更简洁。

---

### 错误 5：在 dispatch 中做计算 ❌

```jsx
// ❌ 错误：把计算逻辑放在组件里
function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleAdd = (text) => {
    const newTodo = {
      id: Date.now(),  // 💀 ID 生成在组件里
      text,
      completed: false,
      createdAt: new Date().toISOString()  // 💀 时间戳在组件里
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };
}

// ✅ 正确：让 reducer 负责完整的状态转换
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      // ✅ 所有计算逻辑都在 reducer
      const newTodo = {
        id: state.nextId,
        text: action.payload.text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
        nextId: state.nextId + 1
      };
  }
}

function TodoApp() {
  const handleAdd = (text) => {
    // ✅ 组件只负责派发动作
    dispatch({ type: 'ADD_TODO', payload: { text } });
  };
}
```

**为什么？**
- Reducer 可以测试，组件内的逻辑难以测试
- Reducer 集中管理，方便维护
- 避免组件和 reducer 耦合

---

### 错误 6：闭包陷阱 ❌

```jsx
// ❌ 错误：在异步回调中使用旧的 state
function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleDelayedAdd = () => {
    setTimeout(() => {
      // 💀 1 秒后，state 可能已经变了，但这里用的是旧值
      dispatch({
        type: 'ADD_TODO',
        payload: { text: `Todo ${state.todos.length + 1}` }
      });
    }, 1000);
  };
}

// ✅ 方案 A：在 reducer 中生成文本
function reducer(state, action) {
  case 'ADD_TODO_AUTO':
    return {
      ...state,
      todos: [...state.todos, {
        id: state.nextId,
        text: `Todo ${state.todos.length + 1}`,  // ✅ 用最新的 state
        completed: false
      }],
      nextId: state.nextId + 1
    };
}

// ✅ 方案 B：用 useRef 保存最新的 state
const stateRef = useRef(state);
useEffect(() => {
  stateRef.current = state;
}, [state]);

const handleDelayedAdd = () => {
  setTimeout(() => {
    const currentState = stateRef.current;
    dispatch({ type: 'ADD_TODO', payload: { /* 用 currentState */ } });
  }, 1000);
};
```

---

## 下一步学习方向

### 🎯 已掌握（本笔记内容）
- ✅ useReducer 基础语法
- ✅ 何时使用 useReducer
- ✅ 常见模式（表单、列表、购物车）
- ✅ 不可变更新技巧
- ✅ 常见错误与避坑

### 📈 进阶方向

1. **useReducer + Context（跨组件状态共享）**
   - 参考笔记：`react-context.md`
   - 学习如何避免 Context 的性能问题

2. **复杂状态更新（使用 Immer）**
   - 学习 `immer` 库简化深层嵌套对象的更新
   - 不再手动写 `{ ...state, nested: { ...state.nested, ... } }`

3. **TypeScript + useReducer**
   - 定义严格的 Action 类型
   - 使用 Discriminated Unions
   - 让编译器帮你检查错误

4. **状态机模式（XState）**
   - 显式定义状态转换规则
   - 避免不可能的状态组合
   - 可视化状态转换图

5. **外部状态管理库**
   - **Redux**：大型应用、需要中间件（如 Redux Saga）
   - **Zustand**：轻量级、简单易用
   - **Jotai/Recoil**：原子化状态管理

6. **性能优化**
   - 使用 `useMemo` 优化 selector
   - 使用 `React.memo` 避免子组件重渲染
   - Context 分离技巧（State Context + Dispatch Context）

---

## 总结与检查清单

### ✅ 学完本笔记，你应该能：

- [ ] 解释 useReducer 的工作原理（state, dispatch, reducer）
- [ ] 判断何时用 useState vs useReducer
- [ ] 写出正确的不可变更新代码
- [ ] 避免在 reducer 中写副作用
- [ ] 实现一个完整的 Todo List
- [ ] 实现一个带优惠券的购物车
- [ ] 理解选择器（selector）的作用
- [ ] 知道常见错误并能避免

### 🎯 练习建议

1. **基础练习**：实现一个多步骤表单（向导）
   - 步骤：个人信息 → 联系方式 → 确认提交
   - 功能：前进、后退、跳转到指定步骤

2. **进阶练习**：实现一个带搜索、过滤、排序的数据列表
   - 状态：列表数据、搜索关键词、过滤条件、排序方式
   - 功能：实时搜索、多条件过滤、升序/降序排序

3. **综合练习**：实现一个完整的 Trello 看板
   - 多个列表（Todo / Doing / Done）
   - 任务在列表间拖拽移动
   - 添加、编辑、删除任务
   - 本地持久化

---

## 最后的建议

1. **不要为了用而用**：简单场景用 useState 完全够了
2. **先写 useState，重构成 useReducer**：感受痛点后再优化
3. **Reducer 要纯**：任何副作用都放在组件或 useEffect
4. **测试 reducer**：纯函数极易测试，养成写测试的习惯
5. **Action 语义化**：`{ type: 'USER_LOGGED_IN' }` 比 `{ type: 'update' }` 更清晰

---

### 🙋 提问时间

现在你已经学完了 useReducer 的基础和实战，试着回答这些问题：

1. **为什么 useReducer 适合管理购物车，而不是简单计数器？**
2. **如果你的 reducer 有 10 个 case，应该如何优化？**
3. **useReducer 能完全替代 Redux 吗？什么场景下需要 Redux？**

试着自己思考，然后和现有笔记 `react-useReducer.md` 对照，看看有哪些新的理解！

---

**加油！从痛点出发，带着问题学习，你会发现 useReducer 并不难，而是一个解决实际问题的强大工具。** 🚀

