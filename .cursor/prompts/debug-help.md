# Debug 协助模式

> 使用场景：遇到 bug 或报错时，AI 引导你定位和解决问题

## 触发指令

```
遇到问题了：[描述问题或粘贴错误信息]
```

或者

```
@debug
```

---

## AI 引导流程

### 第 1 步：理解问题（提问而非直接给答案）

**AI 会问：**
1. **期望行为是什么？** 你希望代码做什么？
2. **实际发生了什么？** 观察到什么现象？
3. **错误信息是什么？** 完整的错误堆栈？
4. **何时开始的？** 改了什么代码后出现的？
5. **能复现吗？** 每次都出现还是偶尔出现？

### 第 2 步：引导缩小范围

**AI 会建议：**
```
让我们一步步缩小问题范围：

1. 先确认基础环境
   - Node 版本是多少？
   - 依赖安装正确吗？
   - 开发服务器正常运行吗？

2. 隔离问题代码
   - 注释掉部分代码，看问题是否消失
   - 逐步恢复，找到触发问题的最小代码

3. 检查数据流
   - 打印关键变量的值
   - 检查数据格式是否符合预期
   - 检查异步时序
```

### 第 3 步：教授调试技巧

#### 技巧 1：使用 console.log 调试
```typescript
// ❌ 不好的调试
console.log(data)

// ✅ 好的调试
console.log('=== API Response ===')
console.log('Type:', typeof data)
console.log('Value:', data)
console.log('Keys:', Object.keys(data))
console.log('=====================')
```

#### 技巧 2：使用 debugger
```typescript
function handleClick() {
  debugger  // 浏览器会在这里暂停
  const result = complexCalculation()
  // 可以在 DevTools 中查看所有变量
}
```

#### 技巧 3：React DevTools
```
1. 打开 React DevTools
2. 查看组件树
3. 检查 Props 和 State
4. 使用 Profiler 分析性能
```

#### 技巧 4：错误边界
```typescript
// 捕获组件错误
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.log('Error:', error)
    console.log('Error Info:', errorInfo)
  }
}
```

### 第 4 步：分析常见错误模式

#### 模式 1：空指针错误
```
Cannot read property 'name' of undefined
```

**引导思考：**
- 哪个变量是 undefined？
- 为什么会是 undefined？
- 数据加载完成了吗？
- 是否需要条件渲染或可选链？

#### 模式 2：无限循环
```
Maximum update depth exceeded
```

**引导思考：**
- 哪个 useEffect 可能导致无限循环？
- 依赖数组是否正确？
- 是否在每次渲染都创建新对象/数组？

#### 模式 3：闭包陷阱
```
状态值总是旧的
```

**引导思考：**
- 是否在 useEffect 中使用了状态？
- 依赖数组是否包含该状态？
- 是否需要函数式更新？

#### 模式 4：异步时序
```
数据显示不对/请求返回后组件已卸载
```

**引导思考：**
- 是否有竞态条件？
- 是否清理了副作用？
- 是否处理了组件卸载情况？

### 第 5 步：提供验证假设的方法

```typescript
// 假设：数据格式不对
console.log('验证数据格式：', JSON.stringify(data, null, 2))

// 假设：组件没有重渲染
console.log('Component rendered:', Date.now())

// 假设：事件没有触发
const handleClick = () => {
  console.log('✅ Click event fired')
  // ... 其他逻辑
}
```

### 第 6 步：讲解根本原因

```
这个问题的根本原因是：XXX

为什么会这样：
1. ...
2. ...

如何避免：
1. ...
2. ...
```

### 第 7 步：提供解决方案（附带详细注释）

```typescript
// 解决方案代码
```

---

## 常见 Bug 场景手册

### 场景 1：组件不更新

**症状：** 修改了状态，但 UI 没有更新

**调试清单：**
```
□ 是否使用了 setState（而非直接修改）？
□ 是否创建了新对象/数组（不可变更新）？
□ 是否在正确的位置调用 setState？
□ React DevTools 中状态值变了吗？
```

**常见原因：**
```typescript
// ❌ 直接修改
user.name = 'New'
setUser(user)  // React 认为是同一个对象

// ✅ 不可变更新
setUser({ ...user, name: 'New' })
```

### 场景 2：useEffect 无限循环

**症状：** 浏览器卡死，控制台疯狂输出

**调试清单：**
```
□ useEffect 依赖数组是否包含对象/数组？
□ 是否在 useEffect 中更新了依赖的状态？
□ 是否每次渲染都创建新对象？
```

**常见原因：**
```typescript
// ❌ 对象依赖
const config = { url: '/api' }  // 每次渲染都是新对象
useEffect(() => {
  fetch(config.url)
}, [config])  // 无限循环

// ✅ 提取稳定值
const url = '/api'
useEffect(() => {
  fetch(url)
}, [url])
```

### 场景 3：状态值是旧的

**症状：** console.log 显示的值总是旧的

**调试清单：**
```
□ 是否在回调中使用了状态？
□ useEffect 依赖是否完整？
□ 是否需要函数式更新？
```

**常见原因：**
```typescript
// ❌ 闭包陷阱
const [count, setCount] = useState(0)

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count)  // 永远是 0
    setCount(count + 1)  // 永远是 0 + 1
  }, 1000)
  return () => clearInterval(timer)
}, [])  // ❌ 依赖为空

// ✅ 函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => {
      console.log(prev)  // 正确的值
      return prev + 1
    })
  }, 1000)
  return () => clearInterval(timer)
}, [])  // ✅ 不依赖 count
```

### 场景 4：内存泄漏

**症状：** 控制台警告 "Can't perform a React state update on an unmounted component"

**调试清单：**
```
□ 是否在组件卸载后调用了 setState？
□ 是否清理了定时器？
□ 是否取消了异步请求？
```

**常见原因：**
```typescript
// ❌ 没有清理
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data))  // 组件可能已卸载
}, [])

// ✅ 添加清理
useEffect(() => {
  let cancelled = false
  
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      if (!cancelled) {
        setData(data)
      }
    })
  
  return () => {
    cancelled = true
  }
}, [])
```

### 场景 5：TypeScript 类型错误

**症状：** 编译错误，提示类型不匹配

**调试清单：**
```
□ 仔细阅读错误信息（TS 错误很详细）
□ 检查类型定义是否正确
□ 是否处理了 null/undefined？
□ 是否需要类型断言（谨慎使用）？
```

**常见原因：**
```typescript
// ❌ 没有处理可能的 undefined
const user = users.find(u => u.id === id)
console.log(user.name)  // TS 错误：user 可能是 undefined

// ✅ 处理 undefined
const user = users.find(u => u.id === id)
if (user) {
  console.log(user.name)
}
// 或使用可选链
console.log(user?.name)
```

---

## 调试工具使用指南

### Chrome DevTools

**断点调试：**
```
1. 打开 DevTools > Sources
2. 找到对应文件
3. 点击行号设置断点
4. 触发代码执行
5. 使用 Step Over/Into/Out 逐步调试
```

**查看网络请求：**
```
1. 打开 DevTools > Network
2. 刷新页面
3. 检查请求状态、参数、响应
4. 查看时序图
```

### React DevTools

**组件调试：**
```
1. 安装 React DevTools 扩展
2. 打开 Components 标签
3. 选择组件查看 Props/State/Hooks
4. 右键组件 > Edit Hooks/Props 实时测试
```

**性能分析：**
```
1. 打开 Profiler 标签
2. 点击录制
3. 执行操作
4. 停止录制
5. 查看哪些组件重渲染了
```

### VS Code 调试

**配置 launch.json：**
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug React App",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/src"
}
```

---

## Debug 思维训练

### 练习 1：二分查找法
```
问题：代码很长，不知道哪里出错

方法：
1. 注释掉后半部分代码，问题还在吗？
2. 如果在，继续二分前半部分
3. 如果不在，二分后半部分
4. 重复直到找到问题行
```

### 练习 2：最小复现
```
问题：项目很复杂，难以定位

方法：
1. 创建新的最小项目
2. 只复制可能相关的代码
3. 能复现问题吗？
4. 不能就逐步添加代码
5. 能复现就逐步删除代码
6. 找到最小复现代码
```

### 练习 3：对比法
```
问题：不知道为什么这个写法不行

方法：
1. 找一个能工作的类似代码
2. 对比两者差异
3. 逐项修改，接近能工作的代码
4. 找到关键差异
```

---

## 提问模板（让 AI 更好地帮助你）

### 好的提问
```markdown
## 问题描述
期望：点击按钮后计数器加 1
实际：点击后没有反应

## 错误信息
（粘贴完整的错误堆栈）

## 相关代码
（粘贴最小复现代码）

## 已尝试的方法
1. 检查了 onClick 是否绑定 - 已绑定
2. console.log 发现函数没有执行
3. ...

## 环境
- React 18.2.0
- Vite 5.0.8
- Chrome 120
```

### ❌ 不好的提问
```
代码不工作，怎么办？
```

---

**记住：Debug 是一种技能，需要刻意练习。每次遇到 bug 都是提升的机会！**

