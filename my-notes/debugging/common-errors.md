# React 常见错误速查手册

> 收集遇到的所有错误和解决方案，方便快速查找

**创建日期：** 2025-10-21  
**最后更新：** 2025-10-21

---

## 🔍 如何使用本手册

1. 使用 `Ctrl+F` 搜索错误信息关键词
2. 每个错误包含：原因、解决方案、相关链接
3. 按类别组织：Hooks、TypeScript、状态管理等

---

## 🎣 Hooks 相关错误

### 错误 1：Rendered more hooks than during the previous render

**错误信息：**
```
Error: Rendered more hooks than during the previous render
```

**原因：**
- Hook 在条件语句、循环或嵌套函数中调用
- Hook 的调用顺序在不同渲染之间不一致

**错误代码：**
```tsx
// ❌ 错误
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // Hook 在条件语句中
  }
  return <div>...</div>;
}
```

**解决方案：**
```tsx
// ✅ 正确
function Component({ condition }) {
  const [state, setState] = useState(0); // 移到顶层
  
  if (condition) {
    // 使用 state
  }
  return <div>...</div>;
}
```

**相关链接：**
- [React 官方文档 - Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)

---

### 错误 2：Maximum update depth exceeded

**错误信息：**
```
Error: Maximum update depth exceeded. This can happen when a component 
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**原因：**
- 在 useEffect 中调用 setState，但没有正确的依赖数组
- 导致无限循环：render → effect → setState → render → ...

**错误代码：**
```tsx
// ❌ 错误
useEffect(() => {
  setCount(count + 1); // 触发 render → 触发 effect → 无限循环
});
```

**解决方案：**
```tsx
// ✅ 方案 1：添加依赖数组
useEffect(() => {
  setCount(count + 1);
}, []); // 只执行一次

// ✅ 方案 2：添加条件判断
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

---

### 错误 3：Cannot read property of undefined

**错误信息：**
```
TypeError: Cannot read property 'xxx' of undefined
```

**原因：**
- 异步数据未加载完成就访问属性
- 可选属性未做空值检查

**错误代码：**
```tsx
// ❌ 错误
const [user, setUser] = useState<User | null>(null);

return <div>{user.name}</div>; // user 可能是 null
```

**解决方案：**
```tsx
// ✅ 方案 1：可选链
return <div>{user?.name}</div>;

// ✅ 方案 2：条件渲染
if (!user) return <div>Loading...</div>;
return <div>{user.name}</div>;

// ✅ 方案 3：默认值
return <div>{user?.name ?? 'Guest'}</div>;
```

---

## 📘 TypeScript 相关错误

### 错误 4：Type 'null' is not assignable to type 'X'

**错误信息：**
```
Type 'null' is not assignable to type 'User'.
```

**原因：**
- TypeScript 严格空值检查
- 类型定义不包含 null

**错误代码：**
```tsx
// ❌ 错误
const [user, setUser] = useState<User>(null);
```

**解决方案：**
```tsx
// ✅ 使用联合类型
const [user, setUser] = useState<User | null>(null);

// 使用时需要类型守卫
if (user) {
  console.log(user.name); // TypeScript 知道这里 user 不是 null
}
```

**详细记录：**
- 见 `debugging/2025-10-xx-typescript-error.md`（示例）

---

### 错误 5：Property 'xxx' does not exist on type 'never'

**错误信息：**
```
Property 'xxx' does not exist on type 'never'.
```

**原因：**
- TypeScript 无法推断正确的类型
- 通常出现在 useReducer 或复杂的条件逻辑中

**错误代码：**
```tsx
// ❌ 错误
type Action = { type: 'increment' } | { type: 'set' };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'set':
      return { count: action.payload }; // payload 不存在
  }
}
```

**解决方案：**
```tsx
// ✅ 正确定义 Action 类型
type Action = 
  | { type: 'increment' }
  | { type: 'set'; payload: number }; // 添加 payload 属性

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'set':
      return { count: action.payload }; // ✅ 类型正确
  }
}
```

---

## 🔄 状态管理相关错误

### 错误 6：状态更新不触发重渲染

**现象：**
修改状态后，组件没有重新渲染

**原因：**
- 直接修改对象/数组（React 无法检测到变化）
- 使用了相同的引用

**错误代码：**
```tsx
// ❌ 错误：直接修改
const [users, setUsers] = useState([{ id: 1, name: 'Tom' }]);

const updateUser = () => {
  users[0].name = 'Jerry'; // 直接修改
  setUsers(users); // 引用没变，不会重渲染
};
```

**解决方案：**
```tsx
// ✅ 创建新对象/数组
const updateUser = () => {
  setUsers(users.map(user => 
    user.id === 1 
      ? { ...user, name: 'Jerry' }
      : user
  ));
};

// ✅ 使用 Immer（在 Redux Toolkit 中）
const updateUser = () => {
  setUsers(produce(users, draft => {
    draft[0].name = 'Jerry'; // Immer 自动处理不可变更新
  }));
};
```

---

## 🎨 渲染相关错误

### 错误 7：Warning: Each child in a list should have a unique "key" prop

**错误信息：**
```
Warning: Each child in a list should have a unique "key" prop.
```

**原因：**
- 列表渲染缺少 key 属性
- key 使用了 index（不推荐）

**错误代码：**
```tsx
// ❌ 错误：缺少 key
{users.map(user => <div>{user.name}</div>)}

// ⚠️ 不推荐：使用 index
{users.map((user, index) => <div key={index}>{user.name}</div>)}
```

**解决方案：**
```tsx
// ✅ 使用唯一标识符
{users.map(user => <div key={user.id}>{user.name}</div>)}
```

**为什么不用 index？**
- 列表顺序变化时，React 可能会错误地复用组件
- 导致状态混乱或性能问题

---

## 📦 依赖相关错误

### 错误 8：Module not found

**错误信息：**
```
Error: Cannot find module 'xxx'
```

**原因：**
- 依赖未安装
- 导入路径错误

**解决方案：**
```bash
# 安装依赖
npm install xxx

# 清除缓存重装
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 相关资源

### 官方文档
- [React 错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript 常见错误](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

### 工具
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

## 📝 添加新错误

遇到新错误时，使用以下模板：

```markdown
### 错误 X：简短描述

**错误信息：**
粘贴完整错误信息

**原因：**
为什么会出现这个错误

**错误代码：**
导致错误的代码

**解决方案：**
如何解决

**详细记录：**
如果有详细分析，链接到单独的文件
```

---

**最后更新：** 2025-10-21

