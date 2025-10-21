# React 设计模式

> 常见的 React 设计模式和最佳实践

**学习日期：** 待更新  
**相关项目：** `12. React Design Patterns/`

---

## 📚 模式概览

1. 布局组件 (Layout Components)
2. 容器组件 (Container Components)
3. 受控 vs 非受控组件
4. 高阶组件 (HOC)
5. 自定义 Hooks
6. 复合组件 (Compound Components)
7. Render Props
8. 插槽模式 (Slots)

---

## 1️⃣ 布局组件

### 用途
- 复用通用布局结构
- 分离布局逻辑和业务逻辑

### 示例
```tsx
interface LayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

const TwoColumnLayout: React.FC<LayoutProps> = ({ sidebar, content }) => {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
};

// 使用
<TwoColumnLayout
  sidebar={<Sidebar />}
  content={<MainContent />}
/>
```

---

## 2️⃣ 容器组件

### 用途
- 分离数据获取和 UI 渲染
- 提高组件可测试性

### 示例
```tsx
// 容器组件：负责数据
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);
  
  return <UserList users={users} />;
}

// 展示组件：负责 UI
interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
};
```

---

## 3️⃣ 高阶组件 (HOC)

### 用途
- 复用组件逻辑
- 添加额外功能（权限、加载状态等）

### 示例
```tsx
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent({ isLoading, ...props }: P & { isLoading: boolean }) {
    if (isLoading) return <div>Loading...</div>;
    return <Component {...(props as P)} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading users={users} isLoading={loading} />
```

---

## 4️⃣ 复合组件 (Compound Components)

### 用途
- 组件之间共享隐式状态
- 更灵活的 API

### 示例
```tsx
// Tabs 组件
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
} | null>(null);

function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  const { activeTab } = context;
  if (activeTab !== id) return null;
  
  return <div>{children}</div>;
}

// 组合使用
Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanels = TabPanels;
Tabs.TabPanel = TabPanel;

// 使用
<Tabs>
  <Tabs.TabList>
    <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
  </Tabs.TabList>
  
  <Tabs.TabPanels>
    <Tabs.TabPanel id="tab1">Content 1</Tabs.TabPanel>
    <Tabs.TabPanel id="tab2">Content 2</Tabs.TabPanel>
  </Tabs.TabPanels>
</Tabs>
```

---

## 🎯 模式选择指南

| 需求 | 推荐模式 |
|------|---------|
| 复用布局结构 | 布局组件 |
| 分离数据和 UI | 容器组件 |
| 复用逻辑 | 自定义 Hooks |
| 添加功能包装 | HOC |
| 灵活的组合 API | 复合组件 |
| 动态渲染逻辑 | Render Props |

---

## 📍 在项目中的位置
- `12. React Design Patterns/`

---

**最后更新：** 2025-10-21

