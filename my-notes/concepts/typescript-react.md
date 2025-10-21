# TypeScript + React 学习笔记

> React 中的 TypeScript 类型定义、泛型和常见模式

**学习日期：** 待更新  
**相关项目：** `04. React w TypeScript/`, `05. React with TypeScript Projects/`

---

## 🎯 为什么使用 TypeScript？

- ✅ **类型安全**：编译时发现错误
- ✅ **智能提示**：更好的开发体验
- ✅ **重构友好**：重命名、查找引用更准确
- ✅ **文档作用**：类型即文档

---

## 📝 组件 Props 类型

### 基础用法
```tsx
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary'; // 可选属性
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary', // 默认值
  disabled = false 
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
```

### 扩展 HTML 属性
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...rest }) => {
  return (
    <div>
      <label>{label}</label>
      <input {...rest} /> {/* 支持所有原生 input 属性 */}
    </div>
  );
};

// 使用
<Input label="Name" placeholder="Enter name" type="text" />
```

### Children 类型
```tsx
interface CardProps {
  children: React.ReactNode; // 任何可渲染的内容
  title: string;
}

const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

---

## 🎣 Hooks 类型

### useState
```tsx
// 类型推断
const [count, setCount] = useState(0); // 推断为 number

// 显式类型
const [user, setUser] = useState<User | null>(null);

// 复杂类型
interface FormData {
  name: string;
  email: string;
}
const [form, setForm] = useState<FormData>({ name: '', email: '' });
```

### useRef
```tsx
// DOM 引用
const inputRef = useRef<HTMLInputElement>(null);

// 可变值
const countRef = useRef<number>(0);
```

### useReducer
```tsx
type State = { count: number };
type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      return { count: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
```

---

## 🎨 事件处理类型

```tsx
// 常用事件类型
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    // ...
  }
};

// 通用事件处理器
type EventHandler<T> = (e: React.SyntheticEvent<T>) => void;
```

---

## 🔧 泛型组件

### 示例：通用列表组件
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <>
      {items.map((item) => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

const users: User[] = [{ id: 1, name: 'Tom' }];

<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

---

## ⚠️ 常见类型问题

### 问题 1：null 类型错误
```tsx
// ❌ 错误
const [user, setUser] = useState<User>(null);

// ✅ 正确
const [user, setUser] = useState<User | null>(null);

// 使用时需要类型守卫
if (user) {
  console.log(user.name); // TypeScript 知道这里 user 不是 null
}
```

### 问题 2：事件类型不明确
```tsx
// ❌ any 类型
const handleChange = (e: any) => {};

// ✅ 明确类型
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```

### 问题 3：泛型约束
```tsx
// 需要确保 T 有 id 属性
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}
```

---

## 📚 实用类型工具

### React 内置类型
```tsx
// 组件类型
React.FC<Props>
React.ReactNode
React.ReactElement
React.ComponentProps<typeof Component>

// HTML 元素类型
React.HTMLAttributes<HTMLDivElement>
React.InputHTMLAttributes<HTMLInputElement>
React.ButtonHTMLAttributes<HTMLButtonElement>
```

### TypeScript 工具类型
```tsx
// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必需
type RequiredUser = Required<User>;

// Pick - 选择部分属性
type UserName = Pick<User, 'name'>;

// Omit - 排除部分属性
type UserWithoutId = Omit<User, 'id'>;

// Record - 创建对象类型
type UserMap = Record<number, User>;
```

---

## 🔗 延伸学习

### 相关笔记
- [Hooks 详解](hooks.md)
- [常见错误](../debugging/common-errors.md)

### 官方资源
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**最后更新：** 2025-10-21

