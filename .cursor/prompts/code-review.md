# 代码审查模式

> 使用场景：完成代码后，请 AI 进行专业的代码审查

## 触发指令

```
请帮我审查这段代码：[粘贴代码或选中代码]
```

或者

```
@code-review
```

---

## AI 审查流程

### 1. 先肯定优点 ✅
指出代码中做得好的地方：
- 正确的模式使用
- 良好的代码风格
- 合理的架构设计

### 2. 发现问题（按严重程度）

#### 🔴 严重问题（必须修复）
- 会导致 bug 的代码
- 性能问题
- 安全隐患
- 内存泄漏风险

**示例：**
```typescript
// 🔴 问题：useEffect 缺少依赖项，会导致闭包陷阱
useEffect(() => {
  console.log(count)  // count 变化不会反映
}, [])  // ❌ 依赖数组为空

// ✅ 修复
useEffect(() => {
  console.log(count)
}, [count])  // ✅ 添加 count 依赖
```

#### 🟡 改进建议（应该优化）
- 代码可读性
- 可维护性
- 可复用性
- TypeScript 类型完善

**示例：**
```typescript
// 🟡 建议：使用更语义化的命名
const handleClick = () => { /* ... */ }  // ✅ 清晰
const click = () => { /* ... */ }        // ❌ 不够明确

// 🟡 建议：提取魔法数字为常量
const MAX_RETRY_COUNT = 3  // ✅
const count = 3            // ❌ 魔法数字
```

#### 🟢 学习方向（可选优化）
- 更高级的模式
- 性能微优化
- 现代语法
- 工具使用

**示例：**
```typescript
// 🟢 可选：使用可选链简化代码
const name = user && user.profile && user.profile.name  // ❌ 繁琐
const name = user?.profile?.name  // ✅ 更简洁
```

### 3. 提供改进后的完整代码

```typescript
// 改进后的代码（附带完整注释）
```

### 4. 解释每个修改的原因

**为什么这样改：**
1. 原因 1...
2. 原因 2...

### 5. 扩展知识点

**相关最佳实践：**
- 链接到官方文档
- 常见模式
- 大厂实践

### 6. 提出思考题

**思考：**
- 如果需求变化为 XXX，代码应该如何调整？
- 这个组件还有哪些可以改进的地方？

---

## 审查检查清单

### React 组件审查
- [ ] **状态管理**
  - 状态是否必要？
  - 状态位置是否合理？
  - 是否有不必要的重渲染？
  
- [ ] **副作用处理**
  - useEffect 依赖是否正确？
  - 是否有清理逻辑？
  - 是否会导致无限循环？
  
- [ ] **性能优化**
  - 是否需要 useMemo/useCallback？
  - 列表是否有 key？
  - 是否有不必要的计算？
  
- [ ] **错误处理**
  - 是否处理了异步错误？
  - 边界情况是否考虑？
  - 是否有错误边界？

### TypeScript 审查
- [ ] **类型定义**
  - 是否避免了 any？
  - 是否充分利用类型推导？
  - 是否定义了必要的接口？
  
- [ ] **类型安全**
  - 是否有类型断言？是否合理？
  - 是否处理了 null/undefined？

### 代码质量
- [ ] **命名**
  - 变量名是否语义化？
  - 函数名是否描述行为？
  - 组件名是否清晰？
  
- [ ] **可读性**
  - 是否有充分注释？
  - 逻辑是否清晰？
  - 是否有过度嵌套？
  
- [ ] **可维护性**
  - 是否有重复代码？
  - 是否可以提取为可复用逻辑？
  - 是否符合单一职责原则？

### 安全性
- [ ] XSS 防护
- [ ] 输入验证
- [ ] 敏感信息处理

---

## 示例对话

**学生：**
```typescript
请审查这段代码：

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])
  
  return <div>{user.name}</div>
}
```

**AI Mentor：**

### ✅ 做得好的地方
- 使用了 useState 管理用户数据
- 使用了 useEffect 处理副作用

### 🔴 严重问题

**问题 1：useEffect 依赖项缺失**
```typescript
useEffect(() => {
  // ...
}, [])  // ❌ 缺少 userId 依赖
```
**影响：** 当 userId 变化时，不会重新获取数据

**问题 2：可能的空指针错误**
```typescript
return <div>{user.name}</div>  // ❌ user 可能为 null
```
**影响：** 初始渲染时会报错

**问题 3：缺少错误处理**
- 网络请求失败时没有处理
- 没有 loading 状态

**问题 4：内存泄漏风险**
- 组件卸载后 setUser 可能仍被调用

### 🟡 改进建议

**建议 1：添加 TypeScript 类型**
```typescript
interface User {
  name: string
  // ... 其他字段
}

interface Props {
  userId: string
}
```

**建议 2：使用现代 API**
- 使用 async/await 替代 .then()
- 考虑使用 TanStack Query 等库

### ✅ 改进后的代码

```typescript
interface User {
  name: string
  email: string
}

interface Props {
  userId: string
}

function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    // 用于取消请求的标志
    let cancelled = false
    
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(`/api/users/${userId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const data = await res.json()
        
        // 只有在组件未卸载时才更新状态
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchUser()
    
    // 清理函数：防止内存泄漏
    return () => {
      cancelled = true
    }
  }, [userId])  // ✅ 添加 userId 依赖
  
  // 加载状态
  if (loading) {
    return <div>Loading...</div>
  }
  
  // 错误状态
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  // 空状态
  if (!user) {
    return <div>User not found</div>
  }
  
  // 正常渲染
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### 📚 为什么这样改

1. **添加 userId 到依赖数组**
   - userId 变化时重新获取数据
   - 遵循 React Hooks 规则

2. **添加 loading 和 error 状态**
   - 提升用户体验
   - 生产级应用的标准做法

3. **使用 cancelled 标志**
   - 防止组件卸载后调用 setState
   - 避免内存泄漏和警告

4. **完善的错误处理**
   - 捕获网络错误
   - 检查响应状态
   - 显示友好的错误信息

5. **TypeScript 类型**
   - 类型安全
   - 更好的 IDE 提示

### 🚀 进阶方向

**方案 1：使用自定义 Hook**
```typescript
function useFetchUser(userId: string) {
  // 封装逻辑，提高复用性
}
```

**方案 2：使用 TanStack Query**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
})
// 自动处理缓存、重试、loading 等
```

### 💭 思考题

1. 如果需要添加"重试"功能，你会如何实现？
2. 这个组件如何测试？需要 mock 哪些部分？
3. 如果 API 很慢，如何优化用户体验？（提示：骨架屏、乐观更新）

---

**下次审查代码时，可以主动思考这些检查点！**

