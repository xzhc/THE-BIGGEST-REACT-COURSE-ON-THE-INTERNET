# React 状态更新：函数式更新 vs 直接更新

> **学习日期：** 2025-10-23  
> **主题：** useState 的两种更新模式与最佳实践  
> **来源：** React State 实战踩坑与深入理解

---

## 📚 目录

1. [问题引入](#1-问题引入)
2. [两种更新方式对比](#2-两种更新方式对比)
3. [为什么需要函数式更新](#3-为什么需要函数式更新)
4. [问题场景演示](#4-问题场景演示)
5. [核心原理解析](#5-核心原理解析)
6. [不可变更新原理（Immutability）](#6-不可变更新原理immutability)
7. [何时使用哪种方式](#7-何时使用哪种方式)
8. [常见场景速查表](#8-常见场景速查表)
9. [实战案例分析](#9-实战案例分析)
10. [常见错误与陷阱](#10-常见错误与陷阱)
11. [最佳实践](#11-最佳实践)

---

## 1. 问题引入

### 典型场景

在写 Counter 组件时，你可能会疑惑：

```jsx
import { useState } from "react";

export function Counter() {
  const [number, setNumber] = useState(0);
  
  // 🤔 方式 A：直接使用当前值
  const increment = () => {
    setNumber(number + 1);
  };
  
  // 🤔 方式 B：使用函数（函数式更新）
  const increment = () => {
    setNumber((prev) => prev + 1);
  };
  
  // 哪种更好？有什么区别？
}
```

### 初学者的困惑

- 为什么要写成箭头函数的形式？
- 直接 `setNumber(number + 1)` 不行吗？
- 什么时候用哪种方式？

---

## 2. 两种更新方式对比

### 方式 A：直接更新（替换值）

```jsx
const [count, setCount] = useState(0);

// 直接传递新值
setCount(5);                  // 设置为固定值 5
setCount(count + 1);          // 设置为 count + 1
setCount(number * 2);         // 设置为 number * 2
```

**特点：**
- 直接传递一个**具体的值**
- 使用的是**闭包中捕获的旧值**
- 简单直观

### 方式 B：函数式更新（基于前值）

```jsx
const [count, setCount] = useState(0);

// 传递一个函数，参数是最新值
setCount((prev) => prev + 1);      // prev 是 React 保证的最新值
setCount((prev) => prev * 2);
setCount((currentValue) => currentValue + 5);  // 参数名可以自定义
```

**特点：**
- 传递一个**函数**
- 函数参数是 React 保证的**最新状态值**
- 返回值是新的状态

---

## 3. 为什么需要函数式更新

### 核心问题：闭包与异步更新

React 的状态更新是**异步的**，并且函数组件中的状态值会被**闭包捕获**。

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  console.log('组件渲染，count =', count);  // 每次渲染时的 count 值
  
  const increment = () => {
    console.log('函数执行时 count =', count);  // 闭包捕获的值
    setCount(count + 1);
    console.log('setState 后 count =', count);  // 还是旧值！（异步更新）
  };
  
  return <button onClick={increment}>+1</button>;
}
```

**关键认知：**
1. `count` 在每次渲染时是一个**固定的值**（快照）
2. `setState` 不会立即改变当前渲染中的 `count`
3. 只有在**下次重新渲染**时，`count` 才会是新值

---

## 4. 问题场景演示

### 场景 1：一个函数中多次更新

#### ❌ 直接更新 - 只会加 1

```jsx
const [count, setCount] = useState(0);

const increment = () => {
  console.log('开始时 count:', count);  // 0
  
  setCount(count + 1);  // 设置为 0 + 1 = 1
  setCount(count + 1);  // 还是设置为 0 + 1 = 1（count 还是 0）
  setCount(count + 1);  // 还是设置为 0 + 1 = 1（count 还是 0）
  
  console.log('结束时 count:', count);  // 还是 0（状态更新是异步的）
};

// 点击按钮后，count 变成 1，而不是 3！
```

**原因：**
- `count` 在这个函数执行期间是**固定的**（比如是 0）
- 三次 `setCount(count + 1)` 都是在设置 `0 + 1`
- React 会**批量合并**这些更新，最终只设置一次

#### ✅ 函数式更新 - 正确加 3

```jsx
const [count, setCount] = useState(0);

const increment = () => {
  setCount((prev) => {
    console.log('第 1 次，prev =', prev);  // 0
    return prev + 1;  // 返回 1
  });
  
  setCount((prev) => {
    console.log('第 2 次，prev =', prev);  // 1（上一次的结果）
    return prev + 1;  // 返回 2
  });
  
  setCount((prev) => {
    console.log('第 3 次，prev =', prev);  // 2
    return prev + 1;  // 返回 3
  });
};

// 点击按钮后，count 正确变成 3！
```

**原因：**
- 每次 `setCount` 的参数函数都会依次执行
- `prev` 参数是 React 保证的**最新值**（前一次更新的结果）
- 三次更新会**依次应用**

### 场景 2：闭包陷阱（定时器）

#### ❌ 直接更新 - 闭包捕获旧值

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setTimeout(() => {
    setCount(count + 1);  // 使用的是点击时的 count 值
  }, 1000);
};

// 场景：快速点击 3 次按钮
// 期望：1 秒后 count 变成 3
// 实际：1 秒后 count 只变成 1

// 原因：3 个定时器都捕获了点击时的 count（都是 0）
```

**详细分析：**

```jsx
// 第 1 次点击（此时 count = 0）
setTimeout(() => {
  setCount(0 + 1);  // 闭包捕获的 count 是 0
}, 1000);

// 第 2 次点击（此时 count 还是 0）
setTimeout(() => {
  setCount(0 + 1);  // 闭包捕获的 count 还是 0
}, 1000);

// 第 3 次点击（此时 count 还是 0）
setTimeout(() => {
  setCount(0 + 1);  // 闭包捕获的 count 还是 0
}, 1000);

// 1 秒后，3 个定时器都执行 setCount(1)
// 最终 count 只变成 1
```

#### ✅ 函数式更新 - 总是拿到最新值

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setTimeout(() => {
    setCount((prev) => prev + 1);  // prev 总是最新值
  }, 1000);
};

// 快速点击 3 次按钮
// 1 秒后，count 正确变成 3！

// 原因：prev 参数不受闭包影响，React 保证是最新值
```

### 场景 3：事件处理中的连续更新

#### ❌ 直接更新 - 批量处理导致问题

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log('第 1 次设置后:', count);  // 还是 0
  
  setCount(count + 1);
  console.log('第 2 次设置后:', count);  // 还是 0
  
  setCount(count + 1);
  console.log('第 3 次设置后:', count);  // 还是 0
};

// 点击后 count 只变成 1
```

#### ✅ 函数式更新 - 正确处理

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount((prev) => prev + 1);  // +1
  setCount((prev) => prev + 1);  // 再+1
  setCount((prev) => prev + 1);  // 再+1
};

// 点击后 count 正确变成 3
```

---

## 5. 核心原理解析

### React 状态更新机制

#### 1. 状态是快照

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // 每次渲染，count 是一个固定的值（快照）
  // 第 1 次渲染：count = 0
  // 第 2 次渲染：count = 1
  // 第 3 次渲染：count = 2
  
  return <div>{count}</div>;
}
```

#### 2. setState 是异步的

```jsx
const handleClick = () => {
  console.log('before:', count);  // 0
  setCount(count + 1);
  console.log('after:', count);   // 还是 0（没有立即改变）
  
  // 只有在下次渲染时，count 才会是新值
};
```

#### 3. 批量更新（Batching）

React 18 之前，只在事件处理函数中批量更新：

```jsx
// React 17 及之前
const handleClick = () => {
  setCount(count + 1);  // 批量
  setName('John');      // 批量
  // 只触发一次重新渲染
};

setTimeout(() => {
  setCount(count + 1);  // 不批量
  setName('John');      // 不批量
  // 触发两次重新渲染
}, 0);
```

React 18 之后，所有更新都批量处理（Automatic Batching）：

```jsx
// React 18+
setTimeout(() => {
  setCount(count + 1);  // 批量
  setName('John');      // 批量
  // 只触发一次重新渲染
}, 0);
```

### 直接更新 vs 函数式更新的执行流程

#### 直接更新

```jsx
setCount(count + 1);

// React 内部流程：
// 1. 记录新值：1（使用的是闭包中的 count）
// 2. 安排重新渲染
// 3. 如果有多次调用，合并（只保留最后一次的值）
```

#### 函数式更新

```jsx
setCount((prev) => prev + 1);

// React 内部流程：
// 1. 将更新函数加入队列
// 2. 安排重新渲染
// 3. 重新渲染时，依次执行队列中的更新函数
//    - 第 1 个函数的 prev 是当前状态
//    - 第 2 个函数的 prev 是第 1 个函数的返回值
//    - ...依次类推
```

### 伪代码演示

```javascript
// React 内部的简化实现

class StateManager {
  constructor(initialValue) {
    this.state = initialValue;
    this.updateQueue = [];
  }
  
  // 直接更新
  setState(newValue) {
    if (typeof newValue === 'function') {
      // 函数式更新
      this.updateQueue.push(newValue);
    } else {
      // 直接更新：清空队列，只保留这个值
      this.updateQueue = [() => newValue];
    }
    this.scheduleRerender();
  }
  
  // 应用更新
  applyUpdates() {
    this.updateQueue.forEach(update => {
      this.state = update(this.state);  // 每个更新函数接收最新的 state
    });
    this.updateQueue = [];
  }
}

// 示例
const manager = new StateManager(0);

// 直接更新
manager.setState(1);
manager.setState(2);
manager.setState(3);
manager.applyUpdates();
console.log(manager.state);  // 3（只保留最后一个）

// 函数式更新
manager.setState((prev) => prev + 1);  // 3 + 1 = 4
manager.setState((prev) => prev + 1);  // 4 + 1 = 5
manager.setState((prev) => prev + 1);  // 5 + 1 = 6
manager.applyUpdates();
console.log(manager.state);  // 6（依次应用）
```

---

## 6. 不可变更新原理（Immutability）

### 为什么需要创建新对象/数组？

在讨论对象和数组的状态更新时，你可能会疑惑：

```jsx
// 为什么要这样写？
setProfile({ ...profile, name: e.target.value })

// 不能直接这样吗？
profile.name = e.target.value;
setProfile(profile);
```

### 核心原理：React 的引用比较

#### React 如何判断状态是否变化

```jsx
// React 内部简化逻辑
function shouldRerender(oldState, newState) {
  return oldState !== newState;  // 使用 === 比较引用
}
```

**关键：** React 通过 `===` 比较对象的**引用（内存地址）**，而不是对象的内容。

#### 引用比较示例

```javascript
// 场景 1：直接修改对象
const obj = { name: 'John', age: 25 };
obj.name = 'Jane';  // 修改了对象的内容
console.log(obj === obj);  // true（还是同一个对象，地址没变）

// 场景 2：创建新对象
const obj = { name: 'John', age: 25 };
const newObj = { ...obj, name: 'Jane' };  // 创建了新对象
console.log(obj === newObj);  // false（不同的对象，地址不同）
```

### 直接修改 vs 创建新对象

#### ❌ 错误：直接修改（Mutation）

```jsx
const [profile, setProfile] = useState({ name: 'John', age: 25 });

// ❌ 错误写法
const updateName = () => {
  profile.name = 'Jane';  // 直接修改原对象
  setProfile(profile);    // 传入的还是同一个对象
  
  // React 判断：oldProfile === newProfile → true
  // React 认为：状态没变，不重新渲染！
};
```

**为什么不会重新渲染？**
```javascript
// React 内部逻辑
const oldProfile = { name: 'John', age: 25 };  // 地址：0x001
oldProfile.name = 'Jane';  // 修改内容，但地址还是 0x001

// React 比较
oldProfile === oldProfile  // true（同一个地址）
// 结论：没变化，不渲染
```

#### ✅ 正确：创建新对象（Immutable Update）

```jsx
const [profile, setProfile] = useState({ name: 'John', age: 25 });

// ✅ 正确写法
const updateName = () => {
  setProfile({ ...profile, name: 'Jane' });  // 创建新对象
  
  // React 判断：oldProfile !== newProfile → false
  // React 认为：状态变了，重新渲染！
};
```

**为什么会重新渲染？**
```javascript
// React 内部逻辑
const oldProfile = { name: 'John', age: 25 };  // 地址：0x001
const newProfile = { ...oldProfile, name: 'Jane' };  // 地址：0x002（新对象）

// React 比较
oldProfile === newProfile  // false（不同地址）
// 结论：变化了，触发重新渲染
```

### 展开运算符做了什么？

#### 对象展开

```jsx
const profile = { name: 'John', age: 25 };

// 展开运算符
{ ...profile, name: 'Jane' }

// 等价于
{
  name: 'John',   // 先复制
  age: 25,        // 先复制
  name: 'Jane'    // 后覆盖（同名属性后面覆盖前面）
}

// 最终结果（新对象）
{ name: 'Jane', age: 25 }
```

**关键点：**
1. 创建了一个**全新的对象**（新的内存地址）
2. 复制了原对象的所有属性
3. 新属性会覆盖同名的旧属性
4. 未提及的属性保持不变（`age` 保留了）

#### 数组展开

```jsx
const items = ['apple', 'banana'];

// 展开运算符
[...items, 'orange']

// 等价于
['apple', 'banana', 'orange']  // 新数组

// 数组地址变了
items === [...items, 'orange']  // false
```

### 浅拷贝 vs 深拷贝

#### 浅拷贝（Shallow Copy）

展开运算符 `...` 只进行**浅拷贝**：

```jsx
const profile = {
  name: 'John',
  age: 25,
  address: {           // 嵌套对象
    city: 'NYC',
    street: '5th Ave'
  }
};

// 浅拷贝
const newProfile = { ...profile };

// 测试
console.log(newProfile === profile);                    // false（外层是新对象）
console.log(newProfile.address === profile.address);    // true（内层还是同一个引用！）
```

**图示：**
```
oldProfile (地址 0x001)
├─ name: 'John'
├─ age: 25
└─ address (地址 0x100) ─┐
   ├─ city: 'NYC'        │
   └─ street: '5th Ave'  │
                         │
newProfile (地址 0x002)  │  ← 新对象
├─ name: 'John'          │
├─ age: 25               │
└─ address (地址 0x100) ─┘  ← 还是同一个 address！
```

#### 嵌套对象的正确更新

```jsx
const [profile, setProfile] = useState({
  name: 'John',
  age: 25,
  address: { city: 'NYC', street: '5th Ave' }
});

// ❌ 错误：修改了原对象的 address
const updateCity = () => {
  const newProfile = { ...profile };
  newProfile.address.city = 'LA';  // 直接修改，address 还是同一个对象
  setProfile(newProfile);
  // 虽然 newProfile 是新对象，但 address 没变，可能导致问题
};

// ✅ 正确：嵌套对象也要创建新对象
const updateCity = () => {
  setProfile({
    ...profile,
    address: {
      ...profile.address,  // 也创建新的 address 对象
      city: 'LA'
    }
  });
};

// ✅ 更好：使用函数式更新
const updateCity = () => {
  setProfile((prev) => ({
    ...prev,
    address: {
      ...prev.address,
      city: 'LA'
    }
  }));
};
```

### 数组的不可变更新

#### 常见数组操作

```jsx
const [items, setItems] = useState(['apple', 'banana']);

// ❌ 错误：直接修改数组
const addItem = () => {
  items.push('orange');  // 修改了原数组
  setItems(items);       // 地址没变，不会重新渲染
};

// ✅ 正确：创建新数组
const addItem = () => {
  setItems([...items, 'orange']);  // 新数组
};

// ❌ 错误：直接修改
const removeItem = (index) => {
  items.splice(index, 1);  // 修改了原数组
  setItems(items);
};

// ✅ 正确：创建新数组
const removeItem = (index) => {
  setItems(items.filter((_, i) => i !== index));
};

// ❌ 错误：sort 会修改原数组
const sortItems = () => {
  items.sort();  // 直接修改原数组
  setItems(items);
};

// ✅ 正确：先复制再排序
const sortItems = () => {
  setItems([...items].sort());  // 复制后排序
};
```

#### 会修改原数组的方法（要避免）

```jsx
// ❌ 这些方法会修改原数组，不能直接用
array.push()      // 添加元素
array.pop()       // 删除最后一个
array.shift()     // 删除第一个
array.unshift()   // 添加到开头
array.splice()    // 删除/插入
array.sort()      // 排序
array.reverse()   // 反转

// ✅ 使用这些不会修改原数组的方法
array.concat()    // 合并数组
array.slice()     // 切片
array.filter()    // 过滤
array.map()       // 映射
[...array]        // 展开运算符
```

### 为什么这样设计？

#### 1. 性能优化

```jsx
// 引用比较（快速）
oldState === newState  // O(1) 时间复杂度

// vs 深度比较（慢）
JSON.stringify(oldState) === JSON.stringify(newState)  // O(n) 时间复杂度
// 需要遍历所有属性
```

#### 2. 可预测性

```jsx
// ❌ 可变更新：不知道谁修改了数据
const user = { name: 'John' };
someFunction(user);  // 这个函数可能修改了 user
console.log(user.name);  // 不确定是什么

// ✅ 不可变更新：数据不会被意外修改
const user = { name: 'John' };
const newUser = someFunction(user);  // 原 user 不会变
console.log(user.name);  // 一定是 'John'
```

#### 3. 时间旅行（Time Travel）

不可变数据使得状态历史记录成为可能（如 Redux DevTools）：

```jsx
const history = [
  { count: 0 },   // 状态 1
  { count: 1 },   // 状态 2
  { count: 2 }    // 状态 3
];

// 可以轻松回退到任何历史状态
const previousState = history[1];  // 回到 count: 1
```

### 内存管理：旧数据去哪了？

#### JavaScript 的垃圾回收

当你创建新对象时，旧对象会被 JavaScript 的**垃圾回收器（GC）**自动回收：

```jsx
function Profile() {
  const [profile, setProfile] = useState({ name: 'John', age: 25 });
  
  const updateName = () => {
    // 步骤 1：创建新对象
    const newProfile = { ...profile, name: 'Jane' };
    // 此时：oldProfile 和 newProfile 都在内存中
    
    // 步骤 2：更新状态
    setProfile(newProfile);
    // React 内部状态从 oldProfile 变成 newProfile
    
    // 步骤 3：组件重新渲染
    // 新渲染中，局部变量 profile 指向 newProfile
    
    // 步骤 4：oldProfile 的引用计数变成 0
    // 没有任何变量引用 oldProfile 了
    
    // 步骤 5：垃圾回收器自动回收 oldProfile
    // 内存被释放
  };
}
```

#### 引用计数示例

```javascript
// 步骤 1：创建对象
let profile = { name: 'John' };  
// 引用计数：1（profile 变量引用它）

// 步骤 2：另一个变量也引用它
let anotherRef = profile;
// 引用计数：2

// 步骤 3：一个变量不再引用
profile = { name: 'Jane' };  // profile 指向新对象
// 旧对象 { name: 'John' } 引用计数：1

// 步骤 4：最后一个引用也消失
anotherRef = null;
// 旧对象引用计数：0（没人引用了）

// 步骤 5：垃圾回收器自动回收
// JavaScript 引擎检测到引用计数为 0，释放内存
```

#### 你不需要担心

```jsx
// ✅ 正常的状态更新：不用担心内存泄漏
setProfile({ ...profile, name: 'Jane' });
setItems([...items, newItem]);

// JavaScript 引擎会自动回收旧对象
// React 不会"保留"旧状态
```

#### 何时会有内存泄漏？

```jsx
// ❌ 意外的全局变量
function Component() {
  oldData = { huge: 'data' };  // 忘记写 const/let，变成全局变量
  // 即使组件卸载，这个数据也不会被回收！
}

// ✅ 正确：局部变量
function Component() {
  const oldData = { huge: 'data' };  // 组件卸载后会被回收
}

// ❌ 忘记清理定时器
function Component() {
  useEffect(() => {
    const timer = setInterval(() => {
      setData({ huge: 'data' });
    }, 1000);
    // 忘记清理！组件卸载后定时器还在运行
  }, []);
}

// ✅ 正确：清理副作用
function Component() {
  useEffect(() => {
    const timer = setInterval(() => {
      setData({ huge: 'data' });
    }, 1000);
    
    return () => clearInterval(timer);  // 清理定时器
  }, []);
}
```

### 实战总结

#### 对象更新模板

```jsx
// 模板
setObject((prev) => ({
  ...prev,           // 保留其他属性
  property: newValue // 更新指定属性
}));

// 示例
setUser((prev) => ({ ...prev, name: 'Jane' }));
setConfig((prev) => ({ ...prev, theme: 'dark' }));

// 嵌套对象
setProfile((prev) => ({
  ...prev,
  address: {
    ...prev.address,
    city: 'LA'
  }
}));
```

#### 数组更新模板

```jsx
// 添加
setArray((prev) => [...prev, newItem]);
setArray((prev) => [newItem, ...prev]);  // 添加到开头

// 删除
setArray((prev) => prev.filter(item => item.id !== id));

// 更新
setArray((prev) => prev.map(item => 
  item.id === id ? { ...item, name: 'New' } : item
));

// 替换
setArray((prev) => prev.map((item, index) => 
  index === targetIndex ? newItem : item
));

// 排序
setArray((prev) => [...prev].sort((a, b) => a.id - b.id));

// 清空
setArray([]);
```

### 数组对象组合更新（常见场景）

在实际开发中，经常需要处理**数组里存对象**的场景（如 TodoList、ShoppingList）：

```jsx
const [items, setItems] = useState([
  { id: 1, name: 'Apple', quantity: 5 },
  { id: 2, name: 'Banana', quantity: 3 }
]);
```

#### 常见操作模板

##### 1. 添加新对象

```jsx
// ✅ 添加新项
const addItem = (name, quantity) => {
  setItems((prev) => [
    ...prev,
    {
      id: Date.now(),  // 生成唯一 ID
      name,
      quantity: Number(quantity)  // 确保类型正确
    }
  ]);
};

// 实际使用
addItem('Orange', '10');
```

##### 2. 删除对象（按 ID）

```jsx
// ✅ 根据 ID 删除
const removeItem = (id) => {
  setItems((prev) => prev.filter(item => item.id !== id));
};

// 实际使用
removeItem(1);  // 删除 id 为 1 的项
```

##### 3. 更新对象的某个属性

```jsx
// ✅ 更新指定项的属性
const updateQuantity = (id, newQuantity) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { ...item, quantity: newQuantity }  // 创建新对象，只更新 quantity
      : item  // 其他项保持不变
  ));
};

// 实际使用
updateQuantity(1, 10);  // 将 id 为 1 的项的 quantity 改为 10
```

##### 4. 更新对象的多个属性

```jsx
// ✅ 更新多个属性
const updateItem = (id, updates) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { ...item, ...updates }  // 合并更新
      : item
  ));
};

// 实际使用
updateItem(1, { name: 'Red Apple', quantity: 8 });
```

##### 5. 切换布尔值（如 completed）

```jsx
// ✅ 切换完成状态
const toggleCompleted = (id) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { ...item, completed: !item.completed }
      : item
  ));
};

// 实际使用
toggleCompleted(1);  // 切换 id 为 1 的项的 completed 状态
```

##### 6. 批量操作

```jsx
// ✅ 全部标记为完成
const markAllCompleted = () => {
  setItems((prev) => prev.map(item => ({ ...item, completed: true })));
};

// ✅ 清空已完成的项
const clearCompleted = () => {
  setItems((prev) => prev.filter(item => !item.completed));
};

// ✅ 重置所有数量
const resetAllQuantities = () => {
  setItems((prev) => prev.map(item => ({ ...item, quantity: 0 })));
};
```

#### 完整示例：ShoppingList 组件

```jsx
import { useState } from "react";

export function ShoppingList() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  
  // 添加新项
  const addItem = (e) => {
    e.preventDefault();
    
    if (itemName.trim() && itemQuantity) {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: itemName,
          quantity: Number(itemQuantity)
        }
      ]);
      
      // 清空输入
      setItemName('');
      setItemQuantity('');
    }
  };
  
  // 删除项
  const removeItem = (id) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };
  
  // 更新数量
  const updateQuantity = (id, newQuantity) => {
    setItems((prev) => prev.map(item =>
      item.id === id
        ? { ...item, quantity: Number(newQuantity) }
        : item
    ));
  };
  
  // 数量 +1
  const incrementQuantity = (id) => {
    setItems((prev) => prev.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };
  
  // 数量 -1
  const decrementQuantity = (id) => {
    setItems((prev) => prev.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity - 1) }  // 不能小于 0
        : item
    ));
  };
  
  return (
    <div>
      <h2>Shopping List</h2>
      
      {/* 添加表单 */}
      <form onSubmit={addItem}>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
        />
        <input
          type="number"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          placeholder="Quantity"
          min="1"
        />
        <button type="submit">Add Item</button>
      </form>
      
      {/* 列表 */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span>Quantity: {item.quantity}</span>
            <button onClick={() => decrementQuantity(item.id)}>-</button>
            <button onClick={() => incrementQuantity(item.id)}>+</button>
            <button onClick={() => removeItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      {/* 统计 */}
      <p>Total items: {items.length}</p>
      <p>Total quantity: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
    </div>
  );
}
```

#### 关键点总结

1. **唯一 ID**
   ```jsx
   // ✅ 生成唯一 ID 的方法
   id: Date.now()           // 简单场景
   id: crypto.randomUUID()  // 更严格的场景
   id: `${Date.now()}-${Math.random()}`  // 避免冲突
   ```

2. **类型转换**
   ```jsx
   // ✅ 确保数字类型
   quantity: Number(inputValue)
   quantity: parseInt(inputValue, 10)
   quantity: +inputValue  // 一元加号运算符
   ```

3. **条件更新**
   ```jsx
   // ✅ 只更新匹配的项
   setItems((prev) => prev.map(item =>
     item.id === targetId
       ? { ...item, newProperty: newValue }  // 更新这个
       : item  // 保持不变
   ));
   ```

4. **不可变更新核心**
   ```jsx
   // ❌ 错误：直接修改
   const item = items.find(i => i.id === id);
   item.quantity = 10;
   setItems(items);
   
   // ✅ 正确：创建新数组和新对象
   setItems((prev) => prev.map(item =>
     item.id === id
       ? { ...item, quantity: 10 }
       : item
   ));
   ```

5. **表单处理**
   ```jsx
   // ✅ 推荐模式
   const handleSubmit = (e) => {
     e.preventDefault();  // 阻止默认提交
     
     // 验证输入
     if (!itemName.trim()) return;
     if (!itemQuantity || itemQuantity < 1) return;
     
     // 添加项
     setItems((prev) => [...prev, newItem]);
     
     // 清空表单
     setItemName('');
     setItemQuantity('');
   };
   ```

#### 常见错误

##### 错误 1：忘记展开数组

```jsx
// ❌ 错误：丢失了其他项
const addItem = (newItem) => {
  setItems([newItem]);  // 只有新项，旧项都丢了！
};

// ✅ 正确：保留旧项
const addItem = (newItem) => {
  setItems((prev) => [...prev, newItem]);
};
```

##### 错误 2：忘记展开对象

```jsx
// ❌ 错误：丢失了其他属性
const updateQuantity = (id, quantity) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { quantity }  // 只有 quantity，name 等都丢了！
      : item
  ));
};

// ✅ 正确：保留其他属性
const updateQuantity = (id, quantity) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { ...item, quantity }
      : item
  ));
};
```

##### 错误 3：直接修改数组中的对象

```jsx
// ❌ 错误：直接修改
const updateItem = (id, newQuantity) => {
  const item = items.find(i => i.id === id);
  item.quantity = newQuantity;  // 直接修改原对象
  setItems([...items]);  // 虽然创建了新数组，但对象还是同一个
};

// ✅ 正确：创建新对象
const updateItem = (id, newQuantity) => {
  setItems((prev) => prev.map(item =>
    item.id === id
      ? { ...item, quantity: newQuantity }  // 新对象
      : item
  ));
};
```

##### 错误 4：使用索引作为 key

```jsx
// ❌ 不推荐：使用索引作为 key（删除/排序时会有问题）
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ✅ 推荐：使用唯一 ID
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

#### 性能优化提示

```jsx
// 对于大列表，考虑使用 useCallback
const removeItem = useCallback((id) => {
  setItems((prev) => prev.filter(item => item.id !== id));
}, []);

// 对于复杂计算，使用 useMemo
const totalQuantity = useMemo(() => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}, [items]);
```

### 核心要点

1. **React 通过引用比较判断变化** - 必须创建新对象/数组
2. **展开运算符创建新对象** - `{ ...obj }` 和 `[...arr]`
3. **浅拷贝的局限性** - 嵌套对象也要展开
4. **避免直接修改** - push/pop/splice/sort 等方法要避免
5. **垃圾回收自动进行** - 不用担心旧数据，JavaScript 会处理
6. **不可变更新的好处** - 性能、可预测性、时间旅行
7. **数组对象组合** - 使用 map 更新、filter 删除、展开添加

---

## 7. 何时使用哪种方式

### 核心判断标准

> **新值是否依赖旧值？**

```
新值依赖旧值？
├─ 是 → 使用函数式更新
│        setState((prev) => ...)
│
└─ 否 → 直接更新
         setState(newValue)
```

### ✅ 必须用函数式更新的场景

#### 1. 数值运算

```jsx
const [count, setCount] = useState(0);

// ✅ 加减乘除都依赖旧值
setCount((prev) => prev + 1);
setCount((prev) => prev - 1);
setCount((prev) => prev * 2);
setCount((prev) => prev / 2);
```

#### 2. 布尔值切换

```jsx
const [isOpen, setIsOpen] = useState(false);

// ✅ 切换依赖旧值
setIsOpen((prev) => !prev);
```

#### 3. 数组操作

```jsx
const [items, setItems] = useState([]);

// ✅ 添加元素
setItems((prev) => [...prev, newItem]);
setItems((prev) => [newItem, ...prev]);  // 添加到开头

// ✅ 删除元素
setItems((prev) => prev.filter(item => item.id !== id));

// ✅ 更新元素
setItems((prev) => prev.map(item => 
  item.id === id ? { ...item, name: 'New Name' } : item
));

// ✅ 排序
setItems((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
```

#### 4. 对象更新（部分属性）

```jsx
const [user, setUser] = useState({ name: 'John', age: 25 });

// ✅ 更新部分属性，保留其他属性
setUser((prev) => ({ ...prev, age: 26 }));
setUser((prev) => ({ ...prev, name: 'Jane', city: 'NYC' }));
```

#### 5. 连续多次更新

```jsx
// ✅ 一个函数中多次更新同一个状态
const handleClick = () => {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
};
```

#### 6. 异步场景（定时器、Promise）

```jsx
// ✅ 定时器
setTimeout(() => {
  setCount((prev) => prev + 1);
}, 1000);

// ✅ Promise
fetch('/api/data')
  .then(data => {
    setItems((prev) => [...prev, ...data]);
  });

// ✅ async/await
const loadData = async () => {
  const data = await fetchData();
  setItems((prev) => [...prev, ...data]);
};
```

### ✅ 可以直接更新的场景

#### 1. 设置固定值

```jsx
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// ✅ 重置为固定值
setCount(0);
setName('');
setIsOpen(false);
```

#### 2. 设置来自外部的值

```jsx
// ✅ 事件处理
const handleChange = (e) => {
  setValue(e.target.value);  // 来自输入框
};

// ✅ Props 或其他状态
const handleClick = () => {
  setSelectedId(props.defaultId);  // 来自 props
  setActiveTab(currentTab);        // 来自其他变量
};
```

#### 3. 完全替换对象/数组（不保留旧数据）

```jsx
// ✅ 完全替换，不依赖旧值
setUser({ name: 'John', age: 25 });
setItems([1, 2, 3]);
setConfig({ theme: 'dark', language: 'en' });
```

#### 4. API 响应数据（完全替换）

```jsx
// ✅ 用 API 数据完全替换
const loadUser = async () => {
  const data = await fetchUser();
  setUser(data);  // 完全替换，不需要旧数据
};
```

---

## 8. 常见场景速查表

| 场景 | 是否依赖旧值 | 写法 | 说明 |
|------|------------|------|------|
| **数字加减** | ✅ 是 | `setCount((prev) => prev + 1)` | 基于旧值计算 |
| **重置为 0** | ❌ 否 | `setCount(0)` | 固定值 |
| **布尔切换** | ✅ 是 | `setIsOpen((prev) => !prev)` | 取反依赖旧值 |
| **设置为 true** | ❌ 否 | `setIsOpen(true)` | 固定值 |
| **数组添加** | ✅ 是 | `setItems((prev) => [...prev, item])` | 保留旧数组 |
| **数组清空** | ❌ 否 | `setItems([])` | 完全替换 |
| **数组删除** | ✅ 是 | `setItems((prev) => prev.filter(...))` | 基于旧数组 |
| **数组替换** | ❌ 否 | `setItems(newArray)` | 完全替换 |
| **对象更新属性** | ✅ 是 | `setUser((prev) => ({...prev, age: 26}))` | 保留其他属性 |
| **对象完全替换** | ❌ 否 | `setUser({name: 'John', age: 25})` | 完全替换 |
| **输入框值** | ❌ 否 | `setValue(e.target.value)` | 外部值 |
| **表单重置** | ❌ 否 | `setForm(initialValues)` | 固定值 |
| **API 数据（替换）** | ❌ 否 | `setData(response.data)` | 完全替换 |
| **API 数据（追加）** | ✅ 是 | `setData((prev) => [...prev, ...response.data])` | 保留旧数据 |
| **计数器递增** | ✅ 是 | `setCount((prev) => prev + 1)` | 基于旧值 |
| **随机数** | ❌ 否 | `setNumber(Math.random())` | 独立计算 |
| **时间戳** | ❌ 否 | `setTimestamp(Date.now())` | 独立值 |
| **定时器更新** | ✅ 是 | `setCount((prev) => prev + 1)` | 避免闭包陷阱 |

---

## 9. 实战案例分析

### 案例 1：Counter 组件

```jsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  
  // ✅ 正确：依赖旧值，用函数式更新
  const increment = () => {
    setCount((prev) => prev + 1);
  };
  
  const decrement = () => {
    setCount((prev) => prev - 1);
  };
  
  // ✅ 正确：固定值，直接更新
  const reset = () => {
    setCount(0);
  };
  
  // ✅ 正确：连续更新，函数式
  const incrementBy3 = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
      <button onClick={incrementBy3}>+3</button>
    </div>
  );
}
```

### 案例 2：TodoList 组件

```jsx
import { useState } from "react";

export function TodoList() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  
  const addTodo = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() !== "") {
      // ✅ 正确：添加元素依赖旧数组，用函数式更新
      setItems((prev) => [...prev, { id: Date.now(), text: inputValue }]);
      
      // ✅ 正确：重置为空字符串，直接更新
      setInputValue("");
    }
  };
  
  const deleteTodo = (id) => {
    // ✅ 正确：删除元素依赖旧数组，用函数式更新
    setItems((prev) => prev.filter(item => item.id !== id));
  };
  
  const clearAll = () => {
    // ✅ 正确：清空为固定值，直接更新
    setItems([]);
  };
  
  return (
    <div>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={inputValue}
          // ✅ 正确：设置为输入框的值，直接更新
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a todo"
        />
        <button type="submit">Add</button>
      </form>
      
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.text}
            <button onClick={() => deleteTodo(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}
```

### 案例 3：Profile 组件

```jsx
import { useState } from "react";

export function Profile() {
  const [user, setUser] = useState({
    name: 'John',
    age: 25,
    email: 'john@example.com'
  });
  
  // ✅ 正确：更新部分属性，用函数式更新
  const updateName = (newName) => {
    setUser((prev) => ({ ...prev, name: newName }));
  };
  
  const updateAge = (newAge) => {
    setUser((prev) => ({ ...prev, age: newAge }));
  };
  
  const incrementAge = () => {
    // ✅ 正确：基于旧值计算，用函数式更新
    setUser((prev) => ({ ...prev, age: prev.age + 1 }));
  };
  
  // ✅ 正确：完全替换，直接更新
  const resetProfile = () => {
    setUser({
      name: 'John',
      age: 25,
      email: 'john@example.com'
    });
  };
  
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Email: {user.email}</p>
      
      <button onClick={() => updateName('Jane')}>Change Name</button>
      <button onClick={incrementAge}>Age +1</button>
      <button onClick={resetProfile}>Reset</button>
    </div>
  );
}
```

### 案例 4：异步数据加载

```jsx
import { useState, useEffect } from "react";

export function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  
  const loadUsers = async () => {
    const response = await fetch(`/api/users?page=${page}`);
    const data = await response.json();
    
    // ✅ 正确：追加数据，依赖旧数组
    setUsers((prev) => [...prev, ...data]);
    
    // ✅ 正确：页码递增，依赖旧值
    setPage((prev) => prev + 1);
  };
  
  const refreshUsers = async () => {
    const response = await fetch('/api/users?page=1');
    const data = await response.json();
    
    // ✅ 正确：完全替换数据
    setUsers(data);
    
    // ✅ 正确：重置为固定值
    setPage(1);
  };
  
  return (
    <div>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      
      <button onClick={loadUsers}>Load More</button>
      <button onClick={refreshUsers}>Refresh</button>
    </div>
  );
}
```

---

## 10. 常见错误与陷阱

### 错误 1：多次更新只生效一次

```jsx
// ❌ 错误：只会加 1
const handleClick = () => {
  setCount(count + 1);  // count = 0, 设置为 1
  setCount(count + 1);  // count 还是 0, 还是设置为 1
  setCount(count + 1);  // count 还是 0, 还是设置为 1
};

// ✅ 正确：加 3
const handleClick = () => {
  setCount((prev) => prev + 1);  // 0 → 1
  setCount((prev) => prev + 1);  // 1 → 2
  setCount((prev) => prev + 1);  // 2 → 3
};
```

### 错误 2：定时器中的闭包陷阱

```jsx
// ❌ 错误：快速点击 3 次，1 秒后只加 1
const handleClick = () => {
  setTimeout(() => {
    setCount(count + 1);  // 捕获点击时的 count（都是 0）
  }, 1000);
};

// ✅ 正确：快速点击 3 次，1 秒后加 3
const handleClick = () => {
  setTimeout(() => {
    setCount((prev) => prev + 1);  // prev 总是最新值
  }, 1000);
};
```

### 错误 3：对象更新丢失其他属性

```jsx
const [user, setUser] = useState({ name: 'John', age: 25, email: 'john@ex.com' });

// ❌ 错误：丢失了 email
const updateAge = () => {
  setUser({ name: user.name, age: 26 });  // email 丢失了！
};

// ✅ 正确：保留所有其他属性
const updateAge = () => {
  setUser((prev) => ({ ...prev, age: 26 }));
};
```

### 错误 4：数组直接修改（mutation）

```jsx
// ❌ 错误：直接修改数组（React 检测不到变化）
const addItem = () => {
  items.push(newItem);    // 直接修改原数组
  setItems(items);        // React 认为还是同一个数组，不会重新渲染
};

// ✅ 正确：创建新数组
const addItem = () => {
  setItems((prev) => [...prev, newItem]);  // 创建新数组
};
```

### 错误 5：在循环中直接更新

```jsx
// ❌ 错误：循环中多次调用，可能不符合预期
const addMultiple = (newItems) => {
  newItems.forEach(item => {
    setItems([...items, item]);  // items 是旧值，每次都基于同一个旧值
  });
};

// ✅ 正确：使用函数式更新
const addMultiple = (newItems) => {
  newItems.forEach(item => {
    setItems((prev) => [...prev, item]);  // prev 总是最新值
  });
};

// ⭐ 更好：一次更新
const addMultiple = (newItems) => {
  setItems((prev) => [...prev, ...newItems]);
};
```

### 错误 6：不必要的函数式更新

```jsx
// ❌ 冗余：不依赖旧值却用函数式更新
const reset = () => {
  setCount((prev) => 0);  // prev 没用到，为什么要写函数？
};

const handleChange = (e) => {
  setValue((prev) => e.target.value);  // prev 没用到
};

// ✅ 正确：直接更新更简洁
const reset = () => {
  setCount(0);
};

const handleChange = (e) => {
  setValue(e.target.value);
};
```

---

## 11. 最佳实践

### ✅ 推荐做法

#### 1. 建立判断习惯

```jsx
// 每次更新状态前问自己：
// "新值是否需要用到旧值？"

const handleClick = () => {
  // 问：需要旧值吗？
  // 答：需要（+1 操作）
  // 结论：用函数式更新
  setCount((prev) => prev + 1);
  
  // 问：需要旧值吗？
  // 答：不需要（固定值）
  // 结论：直接更新
  setInputValue("");
};
```

#### 2. 对象/数组更新优先函数式

```jsx
// ✅ 对象更新几乎总是需要保留其他属性
setUser((prev) => ({ ...prev, name: 'Jane' }));

// ✅ 数组添加/删除/修改几乎总是基于旧数组
setItems((prev) => [...prev, newItem]);
setItems((prev) => prev.filter(item => item.id !== id));
setItems((prev) => prev.map(item => item.id === id ? updated : item));
```

#### 3. 异步场景必用函数式

```jsx
// ✅ 定时器、Promise、async/await 中总是用函数式更新
setTimeout(() => {
  setCount((prev) => prev + 1);
}, 1000);

fetch('/api/data').then(data => {
  setItems((prev) => [...prev, ...data]);
});

const loadData = async () => {
  const data = await fetchData();
  setItems((prev) => [...prev, ...data]);
};
```

#### 4. 提取更新逻辑为函数

```jsx
// ✅ 复杂更新逻辑提取出来
const addTodo = (text) => {
  setTodos((prev) => [
    ...prev,
    {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    }
  ]);
};

const toggleTodo = (id) => {
  setTodos((prev) => 
    prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    )
  );
};
```

#### 5. 使用更清晰的参数名

```jsx
// ✅ 使用有意义的参数名
setUser((currentUser) => ({ ...currentUser, age: 26 }));
setItems((existingItems) => [...existingItems, newItem]);
setCount((currentCount) => currentCount + 1);

// 常用参数名：prev, current, old, existing
```

### ❌ 避免的做法

#### 1. ❌ 不确定时不要乱猜

```jsx
// ❌ 不确定就随便选一个
setCount(count + 1);  // 可能有问题

// ✅ 不确定就用函数式更新（更安全）
setCount((prev) => prev + 1);
```

#### 2. ❌ 不要直接修改状态

```jsx
// ❌ 永远不要这样做
count = count + 1;           // 直接修改
items.push(newItem);         // 直接修改数组
user.age = 26;               // 直接修改对象

// ✅ 总是通过 setState
setCount((prev) => prev + 1);
setItems((prev) => [...prev, newItem]);
setUser((prev) => ({ ...prev, age: 26 }));
```

#### 3. ❌ 不要在渲染中调用 setState

```jsx
// ❌ 错误：在渲染过程中更新状态（无限循环）
function Component() {
  const [count, setCount] = useState(0);
  
  setCount(count + 1);  // 无限循环！
  
  return <div>{count}</div>;
}

// ✅ 正确：在事件处理或副作用中更新
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount((prev) => prev + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}
```

#### 4. ❌ 不要过度优化

```jsx
// ❌ 没必要的复杂
const reset = () => {
  setCount((prev) => {
    console.log('resetting from', prev);
    return 0;
  });
};

// ✅ 简单就好
const reset = () => {
  setCount(0);
};
```

### 🎯 记忆技巧

#### 口诀

```
基于旧值算新值，函数更新不会错
设置固定或外部值，直接更新更清晰
不确定时用函数式，安全可靠零风险
```

#### 快速判断表

```
看代码中是否有：prev, old, current, existing 等参数名？
├─ 有 → 需要函数式更新
└─ 没有 → 看是否用到了状态变量本身？
    ├─ 用到了（如 count + 1）→ 应该改成函数式更新
    └─ 没用到（如固定值 0）→ 直接更新即可
```

### 📚 学习建议

#### 对于初学者

1. **先理解概念** - 知道为什么需要函数式更新
2. **宁可过度使用** - 不确定时就用函数式更新
3. **多练习场景** - 定时器、多次更新、异步场景
4. **查看控制台** - 理解状态更新的时机

#### 对于进阶者

1. **准确判断** - 快速识别是否依赖旧值
2. **性能意识** - 不必要的函数调用也是成本
3. **代码审查** - 帮助团队成员发现状态更新问题
4. **理解原理** - 深入理解 React 的批量更新机制

---

## 🎓 延伸阅读

### 相关概念

- **React 18 Automatic Batching** - 自动批量更新
- **useReducer** - 复杂状态管理的替代方案
- **Immer** - 简化不可变更新的库
- **React 并发特性** - Concurrent Features

### 进阶话题

1. **为什么 React 不自动检测状态变化？**
   - 性能考虑
   - 不可变数据的优势
   - 浅比较的效率

2. **useState vs useReducer**
   - 简单状态用 useState
   - 复杂状态/多个关联状态用 useReducer

3. **状态更新的优化**
   - React.memo
   - useMemo / useCallback
   - 状态设计原则

---

## 📝 核心要点总结

### 6 个关键认知

1. **状态是快照** - 每次渲染中的状态值是固定的
2. **setState 是异步的** - 不会立即改变当前渲染中的状态
3. **依赖旧值必须用函数式更新** - 避免闭包陷阱
4. **函数式更新的 prev 参数总是最新值** - React 保证
5. **不依赖旧值的更新直接传值更清晰** - 语义明确
6. **必须创建新对象/数组** - React 通过引用比较判断变化，直接修改不会触发重新渲染

### 一句话总结

> **当新值依赖旧值时，使用函数式更新 `setState((prev) => ...)`；不依赖旧值时，直接更新 `setState(value)` 更简洁。更新对象/数组时，必须创建新的引用（使用展开运算符 `...`），直接修改不会触发重新渲染。**

---

## 🔗 相关笔记

- [JSX 深度理解](./jsx-deep-dive.md) - JSX 语法和原理
- [列表渲染与 map](./list-rendering-and-map.md) - 数组操作与 key
- [JavaScript 比较运算符陷阱](./javascript-comparison-operators-pitfalls.md) - JS 常见错误

---

> **最后的话：** React 的状态更新机制是核心概念之一，理解了函数式更新 vs 直接更新的区别，以及不可变更新的原理，能避免大量的 bug。记住核心原则：**依赖旧值就用函数式，不依赖就直接更新；更新对象/数组必须创建新引用，不能直接修改**。养成正确的判断习惯，写出健壮的 React 代码！💪

