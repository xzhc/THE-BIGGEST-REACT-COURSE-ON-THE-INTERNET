# 架构设计模式

> 使用场景：设计新功能、重构代码、讨论项目结构时

## 触发指令

```
我想设计 [功能描述]，应该如何组织代码？
```

或者

```
@architecture
```

---

## AI 引导流程

### 第 1 步：需求分析（引导你梳理需求）

**AI 会问：**
```
让我们先理解清楚需求：

1. 核心功能是什么？
   - 最简单的版本需要什么？
   - 哪些是必须的，哪些是可选的？

2. 数据流是怎样的？
   - 数据从哪里来？
   - 数据需要在哪些组件间共享？
   - 数据会如何变化？

3. 交互流程？
   - 用户如何使用这个功能？
   - 有哪些操作路径？

4. 规模预期？
   - 数据量大概多少？
   - 会有多少个组件使用？
   - 未来可能的扩展？
```

### 第 2 步：技术选型（提供多种方案对比）

**状态管理方案对比：**

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **useState** | 组件内部状态 | 简单直接 | 不能跨组件共享 |
| **Props Drilling** | 2-3层组件 | 简单明了 | 层级多了很繁琐 |
| **Context API** | 跨组件共享（中小规模） | 官方方案，无需依赖 | 性能问题，更新会导致所有消费者重渲染 |
| **Zustand** | 全局状态（中等规模） | 简单、性能好、无模板代码 | 功能相对简单 |
| **Redux Toolkit** | 大型应用，复杂状态逻辑 | 强大、生态完善、DevTools | 模板代码多，学习曲线陡 |

**组件设计方案对比：**

| 模式 | 何时使用 | 示例 |
|------|---------|------|
| **Container vs Presentational** | 分离数据和展示 | `UserListContainer` + `UserList` |
| **Compound Components** | 灵活的组件组合 | `<Select><Option /></Select>` |
| **Render Props** | 共享逻辑但不同渲染 | `<DataProvider render={data => ...} />` |
| **Custom Hooks** | 复用状态逻辑 | `useAuth()`, `useFetch()` |
| **HOC** | 增强组件功能 | `withAuth(Component)` |

### 第 3 步：设计目录结构

```
推荐结构（按功能划分）：

src/
├── features/              # 功能模块
│   ├── auth/
│   │   ├── components/    # 认证相关组件
│   │   ├── hooks/         # 认证相关 hooks
│   │   ├── services/      # API 调用
│   │   ├── store/         # 状态管理
│   │   ├── types/         # TypeScript 类型
│   │   └── utils/         # 工具函数
│   └── products/
│       ├── components/
│       ├── hooks/
│       └── ...
├── shared/                # 共享资源
│   ├── components/        # 通用组件
│   ├── hooks/             # 通用 hooks
│   ├── utils/             # 工具函数
│   ├── types/             # 通用类型
│   └── constants/         # 常量
├── layouts/               # 布局组件
├── routes/                # 路由配置
└── App.tsx

为什么这样组织：
1. 按功能而非类型：相关代码在一起，易于维护
2. 清晰的边界：每个 feature 是独立的
3. 易于扩展：添加新功能只需新建文件夹
4. 易于测试：功能内聚，测试简单
```

### 第 4 步：设计数据结构

**引导思考：**
```typescript
// 问题：用户列表的状态应该怎么设计？

// ❌ 方案 1：平铺
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)
// 问题：状态太分散，难以管理

// ✅ 方案 2：结构化
interface UsersState {
  data: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
  ui: {
    loading: boolean
    error: Error | null
  }
}
// 优点：结构清晰，易于扩展

// ⭐ 方案 3：归一化（大量数据）
interface UsersState {
  byId: Record<string, User>    // { 'user1': {...}, 'user2': {...} }
  allIds: string[]               // ['user1', 'user2', ...]
  pagination: {...}
  ui: {...}
}
// 优点：
// 1. O(1) 查找
// 2. 避免重复数据
// 3. 更新单个用户很简单
```

### 第 5 步：设计组件层次

```typescript
/**
 * 示例：用户管理功能的组件结构
 */

// 1. 页面组件（路由层）
function UsersPage() {
  // 协调各个部分
  return (
    <PageLayout>
      <UsersHeader />
      <UsersFilters />
      <UsersTable />
      <UsersPagination />
    </PageLayout>
  )
}

// 2. 容器组件（逻辑层）
function UsersTable() {
  const { users, loading } = useUsers()
  
  if (loading) return <Skeleton />
  
  return <UsersTableView users={users} />
}

// 3. 展示组件（视图层）
function UsersTableView({ users }: Props) {
  return (
    <table>
      {users.map(user => (
        <UserRow key={user.id} user={user} />
      ))}
    </table>
  )
}

// 4. 自定义 Hook（逻辑复用）
function useUsers() {
  // 封装所有用户相关逻辑
}
```

### 第 6 步：讨论关键设计决策

**性能优化：**
```typescript
// 何时需要 useMemo？
// ❌ 不需要：简单计算
const doubled = count * 2  // 直接计算即可

// ✅ 需要：复杂计算 + 频繁渲染
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name))
}, [users])

// 何时需要 useCallback？
// ❌ 不需要：传递给 DOM 元素
<button onClick={() => console.log('clicked')}>Click</button>

// ✅ 需要：传递给优化的子组件
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

<MemoizedChild onClick={handleClick} />
```

**错误处理：**
```typescript
// 错误边界（类组件）
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// 异步错误处理（Hook）
function useAsyncError() {
  const [, setError] = useState()
  return useCallback(
    (error) => setError(() => { throw error }),
    []
  )
}
```

---

## 设计模式示例

### 模式 1：Compound Components（复合组件）

**何时使用：** 需要灵活组合的组件

```typescript
// 用法
<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content 1</TabPanel>
    <TabPanel>Content 2</TabPanel>
  </TabPanels>
</Tabs>

// 实现
const TabsContext = createContext()

function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  )
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext)
  return (
    <button 
      onClick={() => setActiveIndex(index)}
      aria-selected={activeIndex === index}
    >
      {children}
    </button>
  )
}

// 优点：
// - 灵活的组合方式
// - 隐式共享状态
// - API 清晰直观
```

### 模式 2：Custom Hooks（自定义 Hooks）

**何时使用：** 复用状态逻辑

```typescript
// 封装表单逻辑
function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<T>>({})
  
  const handleChange = (name: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues({ ...values, [name]: e.target.value })
  }
  
  const validate = (rules: ValidationRules<T>) => {
    // 验证逻辑
  }
  
  return { values, errors, handleChange, validate }
}

// 使用
function LoginForm() {
  const { values, errors, handleChange, validate } = useForm({
    email: '',
    password: ''
  })
  
  return (
    <form>
      <input 
        value={values.email}
        onChange={handleChange('email')}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  )
}
```

### 模式 3：Provider Pattern（提供者模式）

**何时使用：** 跨组件共享配置或服务

```typescript
// Theme Provider
const ThemeContext = createContext<Theme | undefined>(undefined)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// 自定义 Hook 简化使用
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// 使用
function Header() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>{theme}</button>
}
```

### 模式 4：Factory Pattern（工厂模式）

**何时使用：** 根据条件创建不同组件

```typescript
// 表单字段工厂
const fieldComponents = {
  text: TextInput,
  email: EmailInput,
  password: PasswordInput,
  select: SelectInput,
}

function FormField({ type, ...props }: FieldProps) {
  const Component = fieldComponents[type]
  
  if (!Component) {
    console.warn(`Unknown field type: ${type}`)
    return null
  }
  
  return <Component {...props} />
}

// 使用
<FormField type="email" name="email" />
<FormField type="password" name="password" />
```

---

## 架构决策记录模板

```markdown
# ADR: [决策标题]

**日期：** 2025-10-21
**状态：** 提议中 / 已接受 / 已废弃

## 背景
（为什么需要做这个决策）

## 考虑的方案

### 方案 1：[名称]
**描述：** ...
**优点：**
- ...
**缺点：**
- ...

### 方案 2：[名称]
...

## 决策
选择方案 X，因为...

## 后果
**正面影响：**
- ...

**负面影响：**
- ...

**风险：**
- ...

## 参考资料
- [链接1]
- [链接2]
```

---

## 重构检查清单

准备重构代码前，先问自己：

```
□ 为什么要重构？
  - 添加新功能困难？
  - 代码难以理解？
  - 性能问题？
  - 重复代码太多？

□ 测试覆盖够吗？
  - 有单元测试吗？
  - 能验证重构没有破坏功能吗？

□ 重构的范围？
  - 只重构一个函数？
  - 重构整个组件？
  - 重构整个模块？

□ 渐进式还是一次性？
  - 能分步骤吗？
  - 每步都能保持代码可运行？

□ 如何验证？
  - 测试通过？
  - 手动测试关键路径？
  - 性能对比？
```

---

## 学习资源

**官方文档：**
- [React Patterns](https://reactpatterns.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

**大厂实践：**
- Airbnb React Style Guide
- Facebook/Meta 工程博客
- Vercel 工程实践

**优秀开源项目：**
- Next.js（框架设计）
- React Table（复杂组件设计）
- Radix UI（无样式组件库）
- TanStack Query（异步状态管理）

---

**记住：好的架构不是一次性设计出来的，而是迭代演进的。先让它工作，再让它更好！**

