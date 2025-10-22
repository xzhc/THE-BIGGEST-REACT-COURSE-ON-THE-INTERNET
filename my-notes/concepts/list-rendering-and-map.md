# React 列表渲染与 map 方法深度解析

> **学习日期：** 2025-10-22  
> **主题：** 数组 map 方法的工作机制、列表渲染最佳实践、key 的深度理解

---

## 📚 目录

1. [核心问题：item 是什么](#1-核心问题item-是什么)
2. [数据流向追踪](#2-数据流向追踪)
3. [map 方法的内部机制](#3-map-方法的内部机制)
4. [实际执行流程演示](#4-实际执行流程演示)
5. [关键概念解析](#5-关键概念解析)
6. [箭头函数的简写形式](#6-箭头函数的简写形式)
7. [map 的三个参数](#7-map-的三个参数)
8. [代码实践：从差到优](#8-代码实践从差到优)
9. [常见陷阱与解决方案](#9-常见陷阱与解决方案)
10. [为什么 React 中用 map](#10-为什么-react-中用-map)
11. [key 属性详解](#11-key-属性详解)
12. [最佳实践总结](#12-最佳实践总结)

---

## 1. 核心问题：item 是什么

### 示例代码

```jsx
const Shopping = ({ items }) => {
  return (
    <section>
      <ol>
        {items.map((item) => (
          <li key={Math.random() * 5}>{item}</li>
        ))}
      </ol>
    </section>
  );
};

const App = () => {
  return (
    <section>
      <Shopping
        items={["Wireless Earbuds", "Power Bank", "New SSD", "Hoddie"]}
      />
    </section>
  );
};
```

### 关键认知

- ❌ `item` **不是**你定义的变量
- ❌ `item` **不是**全局变量
- ✅ `item` **是** `map` 方法传递给回调函数的**参数**
- ✅ `item` 的名字**可以随意取**（只是一个参数名）

```jsx
// 这些写法都是等价的
items.map((item) => <li>{item}</li>)
items.map((product) => <li>{product}</li>)
items.map((x) => <li>{x}</li>)
items.map((element) => <li>{element}</li>)
```

---

## 2. 数据流向追踪

### 完整的数据传递过程

```jsx
// 步骤 1：App 组件传递 props
<Shopping items={["Wireless Earbuds", "Power Bank", "New SSD", "Hoddie"]} />
//              ↓
//         这个数组通过 props 传递

// 步骤 2：Shopping 组件接收 props
const Shopping = ({ items }) => {
  // items 此时是：["Wireless Earbuds", "Power Bank", "New SSD", "Hoddie"]
  
  // 步骤 3：调用 map 方法遍历数组
  items.map((item) => { 
    // 每次迭代，map 会把当前元素传递给这个回调函数
    // 第1次：item = "Wireless Earbuds"
    // 第2次：item = "Power Bank"
    // 第3次：item = "New SSD"
    // 第4次：item = "Hoddie"
  })
}
```

### 可视化流程图

```
App 组件
  ↓ 通过 props 传递数组
Shopping 组件
  ↓ 调用 map 方法
数组遍历
  ↓ 每个元素作为参数传递给回调函数
回调函数（箭头函数）
  ↓ 返回 JSX 元素
新数组（JSX 元素数组）
  ↓ 渲染到 DOM
最终 UI
```

---

## 3. map 方法的内部机制

### map 是如何工作的？

`map` 是 JavaScript 数组的内置方法，它的核心作用是：**遍历数组，对每个元素执行回调函数，返回一个新数组**。

### 伪代码实现

```javascript
// map 方法的简化实现
Array.prototype.map = function(callback) {
  const result = [];  // 1. 创建空数组存储结果
  
  // 2. 遍历原数组的每个元素
  for (let i = 0; i < this.length; i++) {
    // 3. 调用回调函数，传入三个参数：
    //    - 当前元素
    //    - 当前索引
    //    - 原数组本身
    const transformedValue = callback(this[i], i, this);
    //                              ↑        ↑   ↑
    //                          当前元素   索引  原数组
    
    // 4. 将回调函数的返回值添加到新数组
    result.push(transformedValue);
  }
  
  // 5. 返回新数组（不修改原数组）
  return result;
}
```

### 关键特性

| 特性 | 说明 |
|------|------|
| **返回值** | 返回一个新数组，长度与原数组相同 |
| **不可变性** | 不会修改原数组 |
| **回调函数** | 接收一个函数作为参数（高阶函数） |
| **参数传递** | 每次迭代会传递 `(element, index, array)` |

---

## 4. 实际执行流程演示

### 逐步执行分析

```jsx
// 原始数据
const items = ["Wireless Earbuds", "Power Bank", "New SSD", "Hoddie"];

// map 执行过程
items.map((item) => <li key={Math.random() * 5}>{item}</li>)

// ============================================
// 第 1 次迭代
// ============================================
// item = "Wireless Earbuds"
// 返回: <li key={0.123...}>Wireless Earbuds</li>

// ============================================
// 第 2 次迭代
// ============================================
// item = "Power Bank"
// 返回: <li key={0.456...}>Power Bank</li>

// ============================================
// 第 3 次迭代
// ============================================
// item = "New SSD"
// 返回: <li key={0.789...}>New SSD</li>

// ============================================
// 第 4 次迭代
// ============================================
// item = "Hoddie"
// 返回: <li key={0.234...}>Hoddie</li>

// ============================================
// map 最终返回的新数组
// ============================================
[
  <li key={0.123...}>Wireless Earbuds</li>,
  <li key={0.456...}>Power Bank</li>,
  <li key={0.789...}>New SSD</li>,
  <li key={0.234...}>Hoddie</li>
]
```

### 在 JSX 中的展开

```jsx
<ol>
  {items.map((item) => <li key={item}>{item}</li>)}
</ol>

// ↓ 等价于

<ol>
  {[
    <li key="Wireless Earbuds">Wireless Earbuds</li>,
    <li key="Power Bank">Power Bank</li>,
    <li key="New SSD">New SSD</li>,
    <li key="Hoddie">Hoddie</li>
  ]}
</ol>

// ↓ React 会自动展开数组，等价于

<ol>
  <li key="Wireless Earbuds">Wireless Earbuds</li>
  <li key="Power Bank">Power Bank</li>
  <li key="New SSD">New SSD</li>
  <li key="Hoddie">Hoddie</li>
</ol>
```

---

## 5. 关键概念解析

### 5.1 回调函数（Callback Function）

```jsx
// 方式 1：内联箭头函数
items.map((item) => <li>{item}</li>)

// 方式 2：普通箭头函数
items.map((item) => {
  return <li>{item}</li>
})

// 方式 3：外部定义函数
const renderItem = (item) => <li>{item}</li>
items.map(renderItem)

// 方式 4：传统函数写法
items.map(function(item) {
  return <li>{item}</li>
})
```

### 5.2 高阶函数（Higher-Order Function）

`map` 是一个高阶函数，因为它：
- 接收函数作为参数
- 返回新的数据结构

```javascript
// map 是高阶函数的例子
const numbers = [1, 2, 3, 4];
const doubled = numbers.map((n) => n * 2);  // [2, 4, 6, 8]

// 其他高阶函数
numbers.filter((n) => n > 2);     // [3, 4]
numbers.reduce((sum, n) => sum + n, 0);  // 10
numbers.find((n) => n === 3);     // 3
```

---

## 6. 箭头函数的简写形式

### 不同写法对比

```jsx
// ✅ 完整写法：显式 return
items.map((item) => {
  return <li key={item}>{item}</li>
})

// ✅ 简写形式 1：隐式 return（推荐用于单个 JSX）
items.map((item) => (
  <li key={item}>{item}</li>
))

// ✅ 简写形式 2：单行时更简洁
items.map(item => <li key={item}>{item}</li>)

// ✅ 多行 JSX 时加括号
items.map((item) => (
  <div>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))

// ❌ 错误：使用 {} 但没有 return
items.map((item) => {
  <li>{item}</li>  // 返回 undefined！
})
```

### 语法规则总结

| 写法 | 何时使用 | 是否需要 return |
|------|---------|----------------|
| `=> { return ... }` | 需要多条语句时 | ✅ 必须 |
| `=> (...)` | 单个表达式/JSX（多行） | ❌ 隐式返回 |
| `=> ...` | 单个表达式（单行） | ❌ 隐式返回 |

---

## 7. map 的三个参数

### 完整参数列表

```jsx
array.map((element, index, array) => {
  // element: 当前元素
  // index: 当前索引（从 0 开始）
  // array: 原数组的引用
})
```

### 实际应用

```jsx
const items = ["Apple", "Banana", "Cherry"];

// 示例 1：只使用 element
items.map((item) => <li>{item}</li>)
// 输出: Apple, Banana, Cherry

// 示例 2：使用 element 和 index
items.map((item, index) => (
  <li key={index}>
    {index + 1}. {item}
  </li>
))
// 输出: 1. Apple, 2. Banana, 3. Cherry

// 示例 3：使用全部参数
items.map((item, index, array) => (
  <li>
    {item} (第 {index + 1} 项，共 {array.length} 项)
  </li>
))
// 输出: Apple (第 1 项，共 3 项)
```

### 常见使用场景

```jsx
// 场景 1：添加序号
items.map((item, index) => (
  <div key={index}>
    <span className="number">{index + 1}</span>
    <span className="content">{item}</span>
  </div>
))

// 场景 2：奇偶行不同样式
items.map((item, index) => (
  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
    <td>{item}</td>
  </tr>
))

// 场景 3：第一个/最后一个元素特殊处理
items.map((item, index, array) => (
  <li 
    key={index}
    className={
      index === 0 ? 'first' : 
      index === array.length - 1 ? 'last' : 
      ''
    }
  >
    {item}
  </li>
))
```

---

## 8. 代码实践：从差到优

### ❌ 不好的做法 1：使用 forEach

```jsx
const Shopping = ({ items }) => {
  const listItems = [];
  
  // ❌ forEach 不返回值，需要手动 push
  items.forEach(item => {
    listItems.push(<li>{item}</li>);
  });
  
  return <ol>{listItems}</ol>;
}
```

**问题：**
- 命令式编程，不符合 React 声明式理念
- 需要额外变量存储结果
- 代码冗长，可读性差

---

### ❌ 不好的做法 2：随机 key

```jsx
const Shopping = ({ items }) => {
  return (
    <ol>
      {items.map((item) => (
        // ⚠️ Math.random() 每次渲染都会变化！
        <li key={Math.random()}>{item}</li>
      ))}
    </ol>
  );
}
```

**问题：**
- 每次渲染 key 都会改变
- React 无法识别哪些元素是同一个
- 导致不必要的 DOM 重建
- 性能问题 + 可能丢失组件状态

---

### ⚠️ 可接受的做法：使用 index

```jsx
const Shopping = ({ items }) => {
  return (
    <ol>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}
```

**适用场景：**
- ✅ 列表是静态的（不会增删改）
- ✅ 列表项没有状态
- ✅ 不会重新排序

**不适用场景：**
- ❌ 可以添加/删除项
- ❌ 可以排序/过滤
- ❌ 列表项有输入框等状态

---

### ✅ 好的做法：使用唯一 ID

```jsx
const App = () => {
  const items = [
    { id: 1, name: "Wireless Earbuds" },
    { id: 2, name: "Power Bank" },
    { id: 3, name: "New SSD" },
    { id: 4, name: "Hoddie" }
  ];

  return <Shopping items={items} />;
};

const Shopping = ({ items }) => {
  return (
    <section>
      <ol>
        {items.map((item) => (
          // ✅ 使用稳定的唯一标识符
          <li key={item.id}>{item.name}</li>
        ))}
      </ol>
    </section>
  );
};
```

**优点：**
- ✅ key 稳定，不会随渲染改变
- ✅ 每个元素有唯一标识
- ✅ React 可以高效地更新 DOM
- ✅ 保留组件状态

---

### ⭐ 更好的做法：复杂列表渲染

```jsx
const ProductList = ({ products }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <article key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p className="price">${product.price}</p>
          <p className="description">{product.description}</p>
          <button onClick={() => addToCart(product.id)}>
            加入购物车
          </button>
        </article>
      ))}
    </div>
  );
};
```

**进阶优化：**
```jsx
// 1. 提取为独立组件
const ProductCard = ({ product, onAddToCart }) => (
  <article className="product-card">
    <img src={product.image} alt={product.name} />
    <h3>{product.name}</h3>
    <p className="price">${product.price}</p>
    <p className="description">{product.description}</p>
    <button onClick={() => onAddToCart(product.id)}>
      加入购物车
    </button>
  </article>
);

const ProductList = ({ products, onAddToCart }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
```

---

## 9. 常见陷阱与解决方案

### 陷阱 1：忘记 return

```jsx
// ❌ 错误：没有返回值
const List = ({ items }) => (
  <ul>
    {items.map((item) => {
      <li>{item}</li>  // 这里没有 return！
    })}
  </ul>
)

// ✅ 解决方案 1：显式 return
{items.map((item) => {
  return <li>{item}</li>
})}

// ✅ 解决方案 2：使用隐式 return
{items.map((item) => (
  <li>{item}</li>
))}
```

---

### 陷阱 2：在 map 中直接渲染对象

```jsx
const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
];

// ❌ 错误：不能直接渲染对象
{users.map(user => <li key={user.id}>{user}</li>)}
// Error: Objects are not valid as a React child

// ✅ 正确：渲染对象的属性
{users.map(user => (
  <li key={user.id}>
    {user.name} - {user.age}岁
  </li>
))}
```

---

### 陷阱 3：日期对象渲染错误

```jsx
const events = [
  { id: 1, name: 'Meeting', date: new Date() }
];

// ❌ 错误：不能直接渲染 Date 对象
{events.map(event => (
  <div key={event.id}>
    {event.name} - {event.date}  {/* 错误！*/}
  </div>
))}

// ✅ 正确：转换为字符串
{events.map(event => (
  <div key={event.id}>
    {event.name} - {event.date.toLocaleDateString()}
  </div>
))}
```

---

### 陷阱 4：混淆 map 和 forEach

```jsx
// ❌ 错误：forEach 不返回值
{items.forEach(item => <li>{item}</li>)}  // 不会渲染任何东西

// ✅ 正确：使用 map
{items.map(item => <li>{item}</li>)}
```

**对比：**

| 方法 | 返回值 | 是否修改原数组 | 用途 |
|------|--------|----------------|------|
| `map` | 新数组 | ❌ | 转换数组元素 |
| `forEach` | `undefined` | ❌ | 遍历执行副作用 |
| `filter` | 新数组（子集） | ❌ | 过滤元素 |
| `reduce` | 单个值 | ❌ | 归并计算 |

---

### 陷阱 5：在 map 中修改原数组

```jsx
// ❌ 危险：修改了原数组
{items.map((item, index) => {
  items[index] = item.toUpperCase();  // 破坏不可变性！
  return <li>{item}</li>
})}

// ✅ 正确：不修改原数组，直接转换
{items.map((item) => (
  <li>{item.toUpperCase()}</li>
))}
```

---

## 10. 为什么 React 中用 map

### 对比：map vs for 循环

| 特性 | map | for 循环 |
|------|-----|----------|
| 返回值 | ✅ 返回新数组 | ❌ 无返回值 |
| 编程范式 | ✅ 声明式 | ❌ 命令式 |
| JSX 嵌入 | ✅ 可以直接嵌入 `{}` 中 | ❌ 需要额外变量 |
| 不可变性 | ✅ 不修改原数组 | ⚠️ 可能修改 |
| 可读性 | ✅ 简洁明了 | ⚠️ 代码冗长 |
| 链式调用 | ✅ 支持 | ❌ 不支持 |

### 示例对比

```jsx
// ❌ for 循环方式（命令式）
const List1 = ({ items }) => {
  const listItems = [];
  for (let i = 0; i < items.length; i++) {
    listItems.push(<li key={i}>{items[i]}</li>);
  }
  return <ul>{listItems}</ul>;
}

// ✅ map 方式（声明式）
const List2 = ({ items }) => (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
)
```

### 函数式编程优势

```jsx
// 链式调用：filter + map
{products
  .filter(p => p.price > 100)      // 过滤价格 > 100
  .map(p => p.price * 0.9)         // 打9折
  .map(price => <li>{price}</li>)  // 渲染
}

// 等价的命令式写法（冗长）
const filteredProducts = [];
for (let i = 0; i < products.length; i++) {
  if (products[i].price > 100) {
    filteredProducts.push(products[i]);
  }
}

const discountedPrices = [];
for (let i = 0; i < filteredProducts.length; i++) {
  discountedPrices.push(filteredProducts[i].price * 0.9);
}

const listItems = [];
for (let i = 0; i < discountedPrices.length; i++) {
  listItems.push(<li key={i}>{discountedPrices[i]}</li>);
}
```

---

## 11. key 属性详解

### 为什么需要 key？

React 使用 key 来识别哪些元素改变了（添加、删除、重新排序）。

```jsx
// 没有 key 的情况
<ul>
  <li>Apple</li>
  <li>Banana</li>
</ul>

// 添加新元素后
<ul>
  <li>Cherry</li>  {/* React 不知道这是新增的 */}
  <li>Apple</li>   {/* 还是这些是移动的 */}
  <li>Banana</li>
</ul>

// 有 key 的情况
<ul>
  <li key="apple">Apple</li>
  <li key="banana">Banana</li>
</ul>

// 添加新元素后
<ul>
  <li key="cherry">Cherry</li>  {/* React 知道这是新的 */}
  <li key="apple">Apple</li>    {/* 这个没变 */}
  <li key="banana">Banana</li>  {/* 这个也没变 */}
</ul>
```

### key 的作用机制

```
没有 key：
旧: [A, B, C]
新: [D, A, B, C]
React 的处理：修改第1个、修改第2个、修改第3个、添加第4个 ❌

有 key：
旧: [<A key="a">, <B key="b">, <C key="c">]
新: [<D key="d">, <A key="a">, <B key="b">, <C key="c">]
React 的处理：添加 D，保持 A B C 不变 ✅
```

### key 的选择策略

```jsx
// ⭐ 最佳：使用数据库 ID
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ✅ 好：使用唯一标识符（UUID、nanoid）
import { nanoid } from 'nanoid';
const items = data.map(item => ({ ...item, id: nanoid() }));

// ⚠️ 可接受：使用 index（仅限静态列表）
{staticItems.map((item, index) => (
  <li key={index}>{item}</li>
))}

// ❌ 不好：使用随机数
{items.map(item => (
  <li key={Math.random()}>{item}</li>
))}

// ❌ 不好：使用不稳定的值
{items.map(item => (
  <li key={Date.now()}>{item}</li>
))}
```

### key 必须满足的条件

| 条件 | 说明 | 示例 |
|------|------|------|
| **唯一性** | 同级元素中必须唯一 | ✅ `id: 1, 2, 3` |
| **稳定性** | 不会随渲染改变 | ❌ `Math.random()` |
| **可预测性** | 相同数据相同 key | ✅ `user.id` |

---

## 12. 最佳实践总结

### ✅ 推荐做法

```jsx
// 1. 使用唯一 ID 作为 key
{products.map(product => (
  <ProductCard key={product.id} product={product} />
))}

// 2. 复杂 JSX 提取为组件
const TodoItem = ({ todo }) => (
  <li className={todo.completed ? 'done' : ''}>
    <input type="checkbox" checked={todo.completed} />
    <span>{todo.text}</span>
  </li>
);

const TodoList = ({ todos }) => (
  <ul>
    {todos.map(todo => (
      <TodoItem key={todo.id} todo={todo} />
    ))}
  </ul>
);

// 3. 使用隐式 return 简化代码
{items.map(item => <li key={item.id}>{item.name}</li>)}

// 4. 条件渲染 + map 结合
{items.length > 0 ? (
  items.map(item => <Card key={item.id} data={item} />)
) : (
  <p>暂无数据</p>
)}

// 5. filter + map 链式调用
{products
  .filter(p => p.inStock)
  .map(p => <ProductCard key={p.id} product={p} />)
}
```

---

### ❌ 避免的做法

```jsx
// 1. 不要在 map 中使用随机 key
{items.map(item => <li key={Math.random()}>{item}</li>)}

// 2. 不要忘记 return
{items.map(item => {
  <li>{item}</li>  // ❌ 没有 return
})}

// 3. 不要直接渲染对象
{users.map(user => <li key={user.id}>{user}</li>)}

// 4. 不要在动态列表中使用 index 作为 key
{sortableItems.map((item, index) => (
  <SortableItem key={index} item={item} />  // ❌ 排序会出问题
))}

// 5. 不要在 map 中修改原数组
{items.map((item, i) => {
  items[i] = processItem(item);  // ❌ 破坏不可变性
  return <li>{item}</li>
})}
```

---

### 🎯 选择合适的数组方法

```jsx
// map - 转换每个元素
{products.map(p => <ProductCard key={p.id} product={p} />)}

// filter - 筛选元素
{products.filter(p => p.price < 100)}

// find - 查找单个元素
{products.find(p => p.id === selectedId)}

// some - 检查是否存在符合条件的元素
{products.some(p => p.inStock)}

// every - 检查是否所有元素都符合条件
{products.every(p => p.price > 0)}

// reduce - 归并计算
{products.reduce((total, p) => total + p.price, 0)}

// 组合使用
{products
  .filter(p => p.inStock)           // 只要有库存的
  .sort((a, b) => a.price - b.price) // 按价格排序
  .map(p => <Card key={p.id} product={p} />)  // 渲染
}
```

---

## 📚 扩展练习

### 练习 1：基础渲染

```jsx
// 需求：渲染用户列表，显示名字和邮箱
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' }
];

// 你的实现：
const UserList = ({ users }) => {
  // TODO: 实现代码
};
```

---

### 练习 2：条件渲染

```jsx
// 需求：只渲染价格 > 100 的商品
const products = [
  { id: 1, name: 'Phone', price: 599 },
  { id: 2, name: 'Case', price: 29 },
  { id: 3, name: 'Charger', price: 39 },
  { id: 4, name: 'Laptop', price: 1299 }
];

// 你的实现：
const ExpensiveProducts = ({ products }) => {
  // TODO: 实现代码
};
```

---

### 练习 3：添加序号

```jsx
// 需求：为每个待办事项添加序号（1. 2. 3. ...）
const todos = [
  { id: 1, text: '学习 React' },
  { id: 2, text: '写代码' },
  { id: 3, text: '休息' }
];

// 你的实现：
const TodoList = ({ todos }) => {
  // TODO: 实现代码
};
```

---

## 🔗 相关资源

- [MDN: Array.prototype.map()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [React 官方文档：列表渲染](https://react.dev/learn/rendering-lists)
- [React 官方文档：Key 的作用](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- [JavaScript 数组方法速查表](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)

---

## 💡 思考题

1. **为什么 map 要返回新数组而不是修改原数组？**
   <details>
   <summary>点击查看答案</summary>
   
   因为 React 遵循不可变性原则（Immutability）。修改原数组会导致：
   - 难以追踪状态变化
   - 破坏 React 的优化机制
   - 可能导致意外的副作用
   
   不可变性让代码更可预测、更易于调试。
   </details>

2. **什么时候可以用 index 作为 key？**
   <details>
   <summary>点击查看答案</summary>
   
   只有在以下所有条件都满足时：
   - 列表是静态的（不会增删改）
   - 列表不会重新排序
   - 列表项没有 ID 或其他唯一标识
   - 列表项没有状态（如输入框）
   
   大多数情况下应该避免使用 index。
   </details>

3. **map 和 forEach 的本质区别是什么？**
   <details>
   <summary>点击查看答案</summary>
   
   - `map`：转换数组，返回新数组（适用于声明式编程）
   - `forEach`：遍历数组，执行副作用，不返回值（适用于命令式编程）
   
   在 React 中，我们需要 map 的返回值来渲染 UI。
   </details>

---

**最后的建议：**

- 🎯 多练习，写 10 个不同的列表渲染场景
- 📖 阅读 React 官方文档关于 key 的部分
- 🔍 在浏览器中观察有无 key 时的渲染差异
- 💪 尝试组合 filter、map、sort 等方法

记住：**理解 map 的本质是理解函数式编程思想的第一步！**

