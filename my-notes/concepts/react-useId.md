## useId 核心笔记

### 1. 是什么？

`useId` 是 React 18 引入的 Hook，用于生成**稳定且唯一**的 ID，主要用于关联表单元素和提升可访问性。

核心特点：
- 生成的 ID 在组件重新渲染时**保持不变**（稳定性）
- 不同组件实例生成**不同的 ID**（唯一性）
- **SSR 兼容**：服务端和客户端生成相同的 ID（避免 hydration 错误）
- **无需参数**：调用时不需要传入任何参数
- 生成格式：类似 `:r1:` 这样的字符串

### 2. 为什么用？

解决三个核心问题：

#### 问题 1：表单可访问性（Accessibility）

```jsx
// ❌ 没有关联：屏幕阅读器无法识别关系
<label>Email</label>
<input type="email" />

// ✅ 使用 ID 关联：
<label htmlFor="email-input">Email</label>
<input id="email-input" type="email" />
```

**好处：**
- 屏幕阅读器能正确读取 label 和 input 的关系
- 点击 label 文字能自动聚焦到 input（更大的点击区域）
- 浏览器能正确显示表单验证错误

#### 问题 2：组件复用时的 ID 冲突

```jsx
// ❌ 硬编码 ID
const LoginForm = () => (
  <>
    <label htmlFor="email">Email</label>
    <input id="email" />
  </>
);

// 如果页面渲染两个 LoginForm，ID 会冲突！
<LoginForm />  // id="email"
<LoginForm />  // id="email" ❌ 重复！
```

#### 问题 3：SSR 时的 ID 不一致

```jsx
// ❌ 使用随机数
const Form = () => {
  const [id] = useState(() => Math.random().toString());
  // 服务端渲染：id = "0.123456"
  // 客户端 hydration：id = "0.789012"
  // React 报错：Hydration failed!
};

// ✅ 使用 useId
const Form = () => {
  const id = useId();
  // 服务端：id = ":r1:"
  // 客户端：id = ":r1:"  ✅ 完全一致
};
```

### 3. 怎么用？

#### 基本用法

```jsx
import { useId } from 'react';

function EmailInput() {
  // 生成唯一 ID
  const id = useId();

  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} type="email" />
    </>
  );
}
```

#### 一个 ID 用于多个元素（推荐）

```jsx
function UserForm() {
  const id = useId();  // 只调用一次
  
  return (
    <div>
      {/* 通过后缀区分不同字段 */}
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} type="email" />
      
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} type="text" />
      
      <label htmlFor={`${id}-phone`}>Phone</label>
      <input id={`${id}-phone`} type="tel" />
    </div>
  );
}
```

### 4. 应用场景

#### 场景 1：表单字段关联

```jsx
function FormField({ label, type = 'text' }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// 使用：每个实例都有唯一 ID
function App() {
  return (
    <form>
      <FormField label="Username" />      {/* id: ":r1:" */}
      <FormField label="Email" type="email" />  {/* id: ":r2:" */}
      <FormField label="Password" type="password" />  {/* id: ":r3:" */}
    </form>
  );
}
```

#### 场景 2：ARIA 属性（可访问性增强）

```jsx
function PasswordInput() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={`${id}-input`}>Password</label>
      <input
        id={`${id}-input`}
        type="password"
        aria-describedby={`${id}-hint`}  // 关联说明文本
      />
      <p id={`${id}-hint`}>
        密码必须包含至少 8 个字符
      </p>
    </div>
  );
}
```

#### 场景 3：表单验证错误提示

```jsx
function ValidatedInput({ label }) {
  const id = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  return (
    <div>
      <label htmlFor={`${id}-input`}>{label}</label>
      <input
        id={`${id}-input`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={!!error}  // 标记是否有错误
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

#### 场景 4：可复用的组件库

```jsx
// 组件库中的 Input 组件
interface InputProps {
  label: string;
  type?: string;
  error?: string;
  hint?: string;
}

function Input({ label, type = 'text', error, hint }: InputProps) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : 
          hint ? `${id}-hint` : 
          undefined
        }
      />
      {hint && <p id={`${id}-hint`}>{hint}</p>}
      {error && <p id={`${id}-error`}>{error}</p>}
    </div>
  );
}
```

### 5. 对比：useId vs 其他方案

| 方案 | 稳定性 | 唯一性 | SSR 兼容 | 性能 | 推荐度 |
|------|--------|--------|----------|------|--------|
| 硬编码 ID | ✅ | ❌ (多实例冲突) | ✅ | ✅ | ⚠️ (仅单实例) |
| Math.random() | ❌ (每次渲染变化) | ✅ | ❌ | ✅ | ❌ |
| uuid 库 | ❌ (每次渲染变化) | ✅ | ❌ | ⚠️ | ❌ |
| useState + random | ✅ | ✅ | ❌ (hydration 错误) | ✅ | ⚠️ |
| **useId** | ✅ | ✅ | ✅ | ✅ | ✅ |

#### 各方案详细对比

```jsx
// ❌ 方案 1：硬编码 ID
function Form() {
  return (
    <>
      <label htmlFor="email">Email</label>
      <input id="email" />
    </>
  );
}
// 问题：渲染多个实例时 ID 冲突

// ❌ 方案 2：每次渲染生成新 ID
function Form() {
  const id = Math.random().toString();
  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} />
    </>
  );
}
// 问题：组件重新渲染时 ID 会变，label 和 input 失去关联

// ⚠️ 方案 3：useState 保存随机 ID
function Form() {
  const [id] = useState(() => Math.random().toString());
  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} />
    </>
  );
}
// 问题：SSR 时服务端和客户端 ID 不一致（hydration mismatch）

// ✅ 方案 4：使用 useId
function Form() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} />
    </>
  );
}
// 完美：稳定、唯一、SSR 兼容
```

### 6. 注意事项

#### ✅ 应该做的

```jsx
// 1. 用于表单元素关联
function Good1() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Username</label>
      <input id={id} />
    </>
  );
}

// 2. 一个 ID 多处使用（添加后缀）
function Good2() {
  const id = useId();
  return (
    <>
      <label htmlFor={`${id}-first`}>First Name</label>
      <input id={`${id}-first`} />
      
      <label htmlFor={`${id}-last`}>Last Name</label>
      <input id={`${id}-last`} />
    </>
  );
}

// 3. 用于 ARIA 属性
function Good3() {
  const id = useId();
  return (
    <>
      <input aria-describedby={id} />
      <p id={id}>帮助文本</p>
    </>
  );
}

// 4. 可选的外部 ID prop
function Good4({ id: externalId }) {
  const generatedId = useId();
  const id = externalId ?? generatedId;  // 优先使用外部 ID
  
  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} />
    </>
  );
}
```

#### ❌ 不应该做的

```jsx
// 1. ❌ 不要用于 key 属性
function Bad1() {
  const id = useId();
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${id}-${index}`}>{item}</li>  // 错误！
      ))}
    </ul>
  );
}
// 原因：key 应该用数据的唯一标识，useId 在这里没有意义

// 2. ❌ 不要每个字段单独调用
function Bad2() {
  const emailId = useId();    // 冗余
  const nameId = useId();     // 冗余
  const phoneId = useId();    // 冗余
  // ...
}
// 原因：效率低，应该一个 ID + 后缀

// 3. ❌ 不要用于 CSS 类名
function Bad3() {
  const id = useId();
  return <div className={id}>Content</div>;  // 错误！
}
// 原因：ID 格式（如 ":r1:"）不适合做类名，可能导致 CSS 解析问题

// 4. ❌ 不要用于数据标识
function Bad4() {
  const id = useId();
  const [user, setUser] = useState({ id, name: '' });  // 错误！
}
// 原因：useId 用于 DOM，不用于业务数据标识
```

### 7. 常见问题

#### Q1：为什么不能用于 key？

```jsx
// ❌ 错误用法
function List() {
  const id = useId();
  return (
    <ul>
      {items.map((item, i) => (
        <li key={`${id}-${i}`}>{item}</li>
      ))}
    </ul>
  );
}

// ✅ 正确用法
function List() {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>  // 使用数据的唯一标识
      ))}
    </ul>
  );
}
```

**原因：**
- `key` 是用来帮助 React 识别列表中的每一项
- 应该使用**数据本身的唯一标识**（如数据库 ID）
- `useId` 生成的是**组件级别**的 ID，与数据无关

#### Q2：为什么 SSR 时需要稳定的 ID？

```jsx
// ❌ 会导致 hydration 错误
function Form() {
  const [id] = useState(() => Math.random().toString());
  return <input id={id} />;
}

// 服务端渲染 HTML：<input id="0.123" />
// 客户端 hydration：<input id="0.456" />
// React 报错：Expected server HTML to contain a matching <input> with id="0.123"
```

**原因：**
- SSR 时，服务端生成 HTML，客户端需要"hydrate"（复用这些 DOM）
- 如果 ID 不一致，React 认为 DOM 结构不匹配，会报错
- `useId` 确保服务端和客户端生成相同的 ID

#### Q3：多个组件实例的 ID 是如何保证唯一的？

```jsx
function App() {
  return (
    <>
      <Form />  {/* useId() 返回 ":r1:" */}
      <Form />  {/* useId() 返回 ":r2:" */}
      <Form />  {/* useId() 返回 ":r3:" */}
    </>
  );
}
```

**原理：**
- React 内部维护一个计数器
- 每次调用 `useId` 时递增
- 考虑组件在树中的位置（即使重新排序也能保持稳定）

#### Q4：可以在循环或条件中调用 useId 吗？

```jsx
// ❌ 错误：违反 Hooks 规则
function Bad() {
  if (condition) {
    const id = useId();  // 错误！
  }
  
  for (let i = 0; i < 3; i++) {
    const id = useId();  // 错误！
  }
}

// ✅ 正确：在顶层调用
function Good() {
  const id = useId();  // 顶层调用
  
  if (condition) {
    return <input id={id} />;
  }
}
```

**原因：**
- 和所有 Hooks 一样，必须在**组件顶层**调用
- 不能在循环、条件或嵌套函数中调用

### 8. 实践建议

#### 1. 组件库开发

```jsx
// 封装可复用的表单组件
interface FormFieldProps {
  label: string;
  type?: string;
  error?: string;
  required?: boolean;
}

function FormField({ 
  label, 
  type = 'text', 
  error, 
  required = false 
}: FormFieldProps) {
  const id = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <input
        id={id}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      
      {error && (
        <p id={`${id}-error`} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

#### 2. 完整的可访问表单示例

```jsx
function AccessibleLoginForm() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  return (
    <form>
      {/* Email 字段 */}
      <div>
        <label htmlFor={`${id}-email`}>
          Email <span aria-label="required">*</span>
        </label>
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email ? `${id}-email-error` : `${id}-email-hint`
          }
        />
        <p id={`${id}-email-hint`} className="hint">
          请输入有效的邮箱地址
        </p>
        {errors.email && (
          <p id={`${id}-email-error`} className="error" role="alert">
            {errors.email}
          </p>
        )}
      </div>
      
      {/* Password 字段 */}
      <div>
        <label htmlFor={`${id}-password`}>
          Password <span aria-label="required">*</span>
        </label>
        <input
          id={`${id}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password 
              ? `${id}-password-error` 
              : `${id}-password-hint`
          }
        />
        <p id={`${id}-password-hint`} className="hint">
          至少 8 个字符
        </p>
        {errors.password && (
          <p id={`${id}-password-error`} className="error" role="alert">
            {errors.password}
          </p>
        )}
      </div>
      
      <button type="submit">登录</button>
    </form>
  );
}
```

#### 3. 支持外部 ID 覆盖

```jsx
interface InputProps {
  label: string;
  id?: string;  // 可选的外部 ID
}

function Input({ label, id: externalId }: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;  // 优先使用外部 ID
  
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}

// 使用方式 1：自动生成 ID
<Input label="Email" />

// 使用方式 2：自定义 ID
<Input label="Email" id="custom-email-input" />
```

### 9. 总结

**useId 解决了什么问题？**
- ✅ 自动生成**稳定且唯一**的 ID
- ✅ **SSR 兼容**：避免 hydration 错误
- ✅ 提升**表单可访问性**（Accessibility）
- ✅ 避免多实例的 **ID 冲突**
- ✅ 无需手动管理计数器或引入外部库

**何时使用 useId？**
- ✅ 关联表单 label 和 input
- ✅ 设置 ARIA 属性（aria-describedby、aria-labelledby 等）
- ✅ 构建可复用的表单组件
- ✅ 需要 SSR 支持的项目

**何时不用 useId？**
- ❌ 列表渲染的 key 属性
- ❌ CSS 类名
- ❌ 业务数据的唯一标识
- ❌ 只有单个实例且不需要 SSR 的简单场景（可以硬编码）

**记住：useId 是为了 DOM 可访问性和 SSR，不是为了数据标识！**

