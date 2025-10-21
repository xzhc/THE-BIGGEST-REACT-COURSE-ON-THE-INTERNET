# React 状态管理对比

> 从 Context API 到 Zustand、Redux，理解不同状态管理方案的适用场景

**学习日期：** 待更新  
**相关项目：** `10. Zustand/`, `11. Redux Toolkit/`

---

## 📊 方案对比总览

| 方案 | 学习曲线 | 样板代码 | 性能 | 适用场景 |
|------|---------|---------|------|---------|
| **Context API** | 低 | 少 | 中 | 简单全局状态 |
| **Zustand** | 低 | 少 | 高 | 中小型项目 |
| **Redux Toolkit** | 中 | 中 | 高 | 大型企业应用 |
| **Jotai/Recoil** | 中 | 少 | 高 | 原子化状态管理 |

---

## 1️⃣ Context API

### 何时使用
- ✅ 主题切换、语言设置
- ✅ 用户认证信息
- ❌ 频繁变化的状态（性能问题）

### 基本用法
```tsx
// 详见：concepts/hooks.md#useContext
```

### ⚠️ 性能问题
```tsx
// ❌ 问题：value 变化会导致所有 Consumer 重渲染
<UserContext.Provider value={{ user, setUser, theme, setTheme }}>
  <App />
</UserContext.Provider>

// ✅ 解决：拆分 Context
<UserContext.Provider value={{ user, setUser }}>
  <ThemeContext.Provider value={{ theme, setTheme }}>
    <App />
  </ThemeContext.Provider>
</UserContext.Provider>
```

---

## 2️⃣ Zustand

### 何时使用
- ✅ 不想写太多样板代码
- ✅ 需要跨组件共享状态
- ✅ 中小型项目
- ❌ 需要严格的类型约束和 DevTools

### 基本用法
```tsx
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// 使用
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

### 💡 优势
- 无需 Provider 包裹
- API 简洁直观
- 自动优化渲染（只有使用的部分变化才重渲染）

### 📍 在项目中的位置
- `10. Zustand With 10 Projects/`

---

## 3️⃣ Redux Toolkit

### 何时使用
- ✅ 大型企业应用
- ✅ 需要时间旅行调试
- ✅ 严格的状态管理规范
- ✅ 复杂的异步逻辑

### 基本用法
```tsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

// 创建 Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer 自动处理不可变更新
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// 创建 Store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// 使用
function Counter() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <button onClick={() => dispatch(counterSlice.actions.increment())}>
      {count}
    </button>
  );
}
```

### 💡 优势
- 强大的 DevTools
- 内置 Immer（不可变更新更简单）
- RTK Query（数据请求）
- 社区生态完善

### 📍 在项目中的位置
- `11. Redux Toolkit/`

---

## 🎯 选择决策树

```
你的项目需要全局状态吗？
├─ 否 → 使用 useState + Props
└─ 是 ↓

  状态复杂度如何？
  ├─ 简单（主题、语言） → Context API
  ├─ 中等（用户信息、购物车） → Zustand
  └─ 复杂（大型应用） → Redux Toolkit

  团队规模？
  ├─ 个人/小团队 → Zustand
  └─ 大团队 → Redux Toolkit（规范统一）

  需要时间旅行调试吗？
  ├─ 是 → Redux Toolkit
  └─ 否 → Zustand
```

---

## 📚 详细笔记

- **Zustand 实战：** 见 `projects/zustand-notes-app.md`
- **Redux Toolkit 实战：** 见 `projects/redux-ecommerce.md`

---

**最后更新：** 2025-10-21

