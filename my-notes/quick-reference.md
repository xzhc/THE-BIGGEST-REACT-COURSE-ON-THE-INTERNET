# React 快速查询手册

> 常用代码片段和命令速查，不求全面，只求实用

---

## 🎣 Hooks 速查

### useState
```tsx
// 基础用法
const [state, setState] = useState(initialValue);

// 函数式更新（避免闭包陷阱）
setState(prev => prev + 1);

// 惰性初始化（性能优化）
const [state, setState] = useState(() => {
  return expensiveComputation();
});

// TypeScript 类型
const [user, setUser] = useState<User | null>(null);
```

### useEffect
```tsx
// 仅执行一次（组件挂载）
useEffect(() => {
  console.log('mounted');
}, []);

// 依赖变化时执行
useEffect(() => {
  console.log('count changed:', count);
}, [count]);

// 清理函数
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);

// ❌ 常见错误：忘记依赖
useEffect(() => {
  console.log(count); // count 应该在依赖数组中
}, []); // ❌ 错误
```

### useRef
```tsx
// DOM 引用
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// 保存可变值（不触发重渲染）
const countRef = useRef(0);
countRef.current += 1;
```

### useReducer
```tsx
const [state, dispatch] = useReducer(reducer, initialState);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

dispatch({ type: 'increment' });
```

---

## 🎨 常用模式

### 异步数据加载
```tsx
const [data, setData] = useState<Data | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

// 渲染
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return null;
return <div>{data.content}</div>;
```

### 表单处理
```tsx
const [form, setForm] = useState({ name: '', email: '' });

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  console.log(form);
};
```

### 条件渲染
```tsx
// 方式 1：&&
{isLoggedIn && <UserProfile />}

// 方式 2：三元运算符
{isLoggedIn ? <UserProfile /> : <Login />}

// 方式 3：提前返回
if (!user) return <Login />;
return <Dashboard user={user} />;
```

### 列表渲染
```tsx
{items.map(item => (
  <Item key={item.id} {...item} />
))}

// ⚠️ 不要用 index 作为 key（除非列表固定不变）
```

---

## 🛠️ 常用命令

### 项目运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 指定端口
npm run dev -- --port 3001

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### Git 工作流
```bash
# 查看状态
git status

# 暂存所有修改
git add .

# 提交
git commit -m "feat: 添加用户登录功能"

# 推送
git push

# 查看提交历史
git log --oneline -5
```

### 常用 npm 包
```bash
# 状态管理
npm install zustand
npm install @reduxjs/toolkit react-redux

# 数据请求
npm install @tanstack/react-query

# 表单
npm install react-hook-form

# 动画
npm install framer-motion

# UI 库
npm install @radix-ui/react-dialog
```

---

## 📝 TypeScript 速查

### 组件 Props
```tsx
// 基础
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ text, onClick, variant = 'primary' }) => {
  return <button onClick={onClick}>{text}</button>;
};

// 扩展 HTML 属性
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
```

### 事件类型
```tsx
// 常用事件类型
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
```

### 泛型组件
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>;
}
```

---

## 🐛 常见错误速查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Rendered more hooks than previous` | Hook 在条件语句中 | 移到组件顶层 |
| `Cannot read property of undefined` | 数据未加载完成 | 添加可选链 `data?.property` |
| `Type 'null' is not assignable` | TypeScript 类型不匹配 | 使用联合类型 `T \| null` |
| `Maximum update depth exceeded` | setState 在无依赖的 useEffect 中 | 添加正确的依赖数组 |
| `Each child should have a unique key` | 列表渲染缺少 key | 添加 `key={item.id}` |

详见：[常见错误详解](debugging/common-errors.md)

---

## 🎯 性能优化速查

```tsx
// useMemo - 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - 缓存函数引用
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// React.memo - 避免不必要的重渲染
const MemoizedComponent = React.memo(Component);

// 懒加载组件
const LazyComponent = React.lazy(() => import('./Component'));
```

---

## 📚 资源链接

### 官方文档
- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)

### 工具
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

**最后更新：** 2025-10-21

