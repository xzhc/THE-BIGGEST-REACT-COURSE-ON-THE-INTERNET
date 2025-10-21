/**
 * 常用 React 模式和代码片段
 * 从项目中提取的实用模式
 */

import React, { useState, useEffect, createContext, useContext } from 'react';

// ============================================
// 1. 异步数据加载模式
// ============================================

interface User {
  id: number;
  name: string;
}

function AsyncDataLoadingPattern() {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/user');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}

// ============================================
// 2. 表单处理模式
// ============================================

interface FormData {
  name: string;
  email: string;
  password: string;
}

function FormHandlingPattern() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // 通用输入处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // 清除该字段的错误
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // 表单验证
  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log('Form submitted:', form);
    // 提交逻辑
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

// ============================================
// 3. Context 状态管理模式
// ============================================

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider 组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook 方便使用
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 使用示例：
// function App() {
//   return (
//     <AuthProvider>
//       <YourApp />
//     </AuthProvider>
//   );
// }
//
// function SomeComponent() {
//   const { user, login, logout } = useAuth();
//   // ...
// }

// ============================================
// 4. 条件渲染模式
// ============================================

function ConditionalRenderingPatterns({ user, loading }: { user?: User; loading: boolean }) {
  // 模式 1：提前返回
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  // 模式 2：三元运算符
  return (
    <div>
      {user ? (
        <div>Welcome, {user.name}</div>
      ) : (
        <div>Please login</div>
      )}
    </div>
  );

  // 模式 3：逻辑与 &&
  return (
    <div>
      {user && <div>Welcome, {user.name}</div>}
    </div>
  );

  // 模式 4：对象映射（多分支）
  const statusComponents = {
    loading: <div>Loading...</div>,
    error: <div>Error occurred</div>,
    success: <div>Success!</div>,
  };

  const status: 'loading' | 'error' | 'success' = 'loading';
  return statusComponents[status];
}

// ============================================
// 5. 列表渲染模式
// ============================================

interface Item {
  id: number;
  name: string;
  active: boolean;
}

function ListRenderingPattern() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Item 1', active: true },
    { id: 2, name: 'Item 2', active: false },
  ]);

  // 添加项目
  const addItem = () => {
    const newItem: Item = {
      id: Date.now(),
      name: `Item ${items.length + 1}`,
      active: false,
    };
    setItems([...items, newItem]);
  };

  // 删除项目
  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // 更新项目
  const toggleActive = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>

      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ opacity: item.active ? 1 : 0.5 }}>
            <span>{item.name}</span>
            <button onClick={() => toggleActive(item.id)}>
              {item.active ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* 空状态 */}
      {items.length === 0 && <p>No items yet. Add one!</p>}
    </div>
  );
}

// ============================================
// 6. 错误边界模式
// ============================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div>
            <h2>Something went wrong</h2>
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.message}</pre>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// 使用示例：
// <ErrorBoundary fallback={<div>Custom error UI</div>}>
//   <YourComponent />
// </ErrorBoundary>

// ============================================
// 7. 防抖输入模式
// ============================================

function DebouncedSearchPattern() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // 防抖逻辑
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 使用 debouncedTerm 进行搜索
  useEffect(() => {
    if (debouncedTerm) {
      console.log('Searching for:', debouncedTerm);
      // 执行搜索逻辑
    }
  }, [debouncedTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}

// ============================================
// 8. 分页模式
// ============================================

function PaginationPattern() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [items] = useState(Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`));

  // 计算总页数
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // 获取当前页的数据
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <ul>
        {currentItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export {
  AsyncDataLoadingPattern,
  FormHandlingPattern,
  ConditionalRenderingPatterns,
  ListRenderingPattern,
  ErrorBoundary,
  DebouncedSearchPattern,
  PaginationPattern,
};

