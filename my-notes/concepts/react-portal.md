# React Portal 完全指南

> **学习日期：** 2025-10-24  
> **主题：** Portal 的本质、使用场景、事件冒泡机制与最佳实践

---

## 📚 目录

1. [什么是 Portal](#1-什么是-portal)
2. [为什么需要 Portal](#2-为什么需要-portal)
3. [Portal 的核心特性](#3-portal-的核心特性)
4. [基本使用方法](#4-基本使用方法)
5. [事件冒泡机制（重要）](#5-事件冒泡机制重要)
6. [Context 和样式继承](#6-context-和样式继承)
7. [常见使用场景](#7-常见使用场景)
8. [生产级最佳实践](#8-生产级最佳实践)
9. [常见问题与误区](#9-常见问题与误区)
10. [完整示例](#10-完整示例)

---

## 1. 什么是 Portal

**Portal** 提供了一种将子节点渲染到**存在于父组件 DOM 层级之外**的 DOM 节点的方案。

### 语法

```javascript
import { createPortal } from 'react-dom';

createPortal(children, domNode)
```

- `children`：要渲染的 React 元素
- `domNode`：目标 DOM 节点（Portal 的内容会渲染到这里）

### 关键认知

- ✅ Portal 改变的是 **DOM 位置**，不改变 **React 组件树**
- ✅ 在 React 组件树中，Portal 仍然是父组件的子组件
- ✅ Portal 保留了所有 React 特性（事件冒泡、Context、Props）
- ❌ Portal 不是 "传送门"，而是 "双重身份"：DOM 在别处，逻辑在原处

---

## 2. 为什么需要 Portal

### 问题场景

当你需要渲染这些 UI 元素时：

- 全屏模态框（Modal）
- 悬浮提示（Tooltip）
- 下拉菜单（Dropdown）
- 通知消息（Notification）

如果按照正常的组件嵌套，会遇到这些 CSS 限制：

```jsx
const Parent = () => {
  return (
    <div style={{ 
      overflow: 'hidden',      // ❌ 会裁剪超出部分
      position: 'relative',    // ❌ 影响 absolute 定位
      transform: 'scale(1.2)', // ❌ 创建新的层叠上下文
      zIndex: 10               // ❌ 限制子元素的层级
    }}>
      <Tooltip text="提示信息">
        <button>悬停</button>
      </Tooltip>
      {/* Tooltip 可能被裁剪或层级错乱 */}
    </div>
  );
};
```

### Portal 的解决方案

将内容渲染到 `<body>` 或其他独立节点，完全不受父容器限制：

```jsx
const Tooltip = ({ text, children }) => {
  return (
    <>
      {children}
      {createPortal(
        <div className="tooltip">{text}</div>,
        document.body  // 渲染到 body，不受任何父容器影响
      )}
    </>
  );
};
```

---

## 3. Portal 的核心特性

### 设计哲学

> **Portal 的目标：突破父组件的 CSS 范围限制，同时保留组件间的逻辑交互**

| 维度         | React 组件树       | DOM 树               |
| ------------ | ------------------ | -------------------- |
| **位置**     | 保持原有父子关系   | 渲染到指定的其他节点 |
| **事件冒泡** | ✅ 按照组件树冒泡   | ❌ 按照 DOM 树冒泡    |
| **Context**  | ✅ 可以访问         | -                    |
| **Props**    | ✅ 正常传递         | -                    |
| **CSS 继承** | ❌ 不继承父组件样式 | ✅ 继承目标节点样式   |

### 示例对比

```jsx
// React 组件树
App
 └─ Container
     └─ Modal  ← 是 Container 的子组件
```

```html
<!-- 实际 DOM 树 -->
<div id="root">
  <div>App</div>
  <div>Container</div>
  <!-- ❌ Modal 不在这里 -->
</div>

<div id="portal-root">
  <div>Modal</div>  <!-- ✅ Modal 实际在这里 -->
</div>
```

---

## 4. 基本使用方法

### 步骤 1：准备目标 DOM 节点

在 `index.html` 中添加 Portal 容器：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>          <!-- React 应用 -->
    <div id="portal-root"></div>   <!-- Portal 目标节点 -->
  </body>
</html>
```

### 步骤 2：创建 Portal 组件

```jsx
import { createPortal } from 'react-dom';

const PopupMessage = ({ message, isVisible }) => {
  // 如果不可见，直接返回 null
  if (!isVisible) return null;
  
  // 使用 createPortal 渲染到 #portal-root
  return createPortal(
    <div className="popup">
      {message}
    </div>,
    document.getElementById('portal-root')
  );
};
```

### 步骤 3：在组件中使用

```jsx
const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowPopup(true)}>
        显示提示
      </button>
      
      {/* 👇 在 React 树中正常使用，但会渲染到 portal-root */}
      <PopupMessage 
        message="操作成功！" 
        isVisible={showPopup} 
      />
    </div>
  );
};
```

---

## 5. 事件冒泡机制（重要）

### ⚠️ 核心概念

虽然 Portal 的 DOM 节点在其他位置，但**事件冒泡仍然按照 React 组件树进行**！

### 为什么这样设计？

如果事件不冒泡，Portal 就无法和父组件交互，违背了设计初衷：
- ❌ 模态框无法通知父组件关闭
- ❌ 下拉菜单无法响应外部点击
- ❌ 提示框无法触发父组件的事件处理

### 实例演示

```jsx
const App = () => {
  const handleAppClick = () => {
    console.log('🎯 App 捕获到点击事件');
  };
  
  return (
    <div onClick={handleAppClick}>
      <h1>点击下面的按钮测试</h1>
      <PortalButton />
    </div>
  );
};

const PortalButton = () => {
  return createPortal(
    <button onClick={() => console.log('👆 按钮被点击')}>
      我在 Portal 里
    </button>,
    document.body  // 渲染到 body
  );
};

// 点击按钮后的输出：
// 👆 按钮被点击
// 🎯 App 捕获到点击事件  ← 成功冒泡！
```

### DOM 结构与事件流

**实际 DOM 树：**
```html
<div id="root">
  <div onclick="handleAppClick">  <!-- App 的 div -->
    <h1>点击下面的按钮测试</h1>
    <!-- ❌ 按钮不在这里 -->
  </div>
</div>

<body>
  <button>我在 Portal 里</button>  <!-- ✅ 按钮在这里 -->
</body>
```

**React 组件树（事件冒泡路径）：**
```
App (div)
 └─ PortalButton (button)  ← 事件从这里冒泡到 App
```

### 阻止事件冒泡

```jsx
const PortalButton = () => {
  return createPortal(
    <button onClick={(e) => {
      console.log('按钮点击');
      e.stopPropagation();  // 阻止 React 事件冒泡
    }}>
      点击
    </button>,
    document.body
  );
};

// 现在 App 的 handleAppClick 不会被触发
```

### 原生 DOM 事件 vs React 合成事件

| 事件类型           | 冒泡路径          | Portal 行为        |
| ------------------ | ----------------- | ------------------ |
| **React 合成事件** | 按照 React 组件树 | ✅ 会冒泡到父组件   |
| **原生 DOM 事件**  | 按照 DOM 树       | ❌ 不会冒泡到父组件 |

```jsx
const App = () => {
  useEffect(() => {
    // 原生事件监听
    const root = document.getElementById('root');
    root.addEventListener('click', () => {
      console.log('原生事件捕获');  // ❌ Portal 按钮点击不会触发
    });
  }, []);
  
  return (
    <div onClick={() => console.log('React 事件捕获')}>  {/* ✅ 会触发 */}
      <PortalButton />
    </div>
  );
};
```

---

## 6. Context 和样式继承

### Context 传递

Portal 中的组件**可以访问父组件的 Context**：

```jsx
const ThemeContext = React.createContext('light');

const App = () => {
  return (
    <ThemeContext.Provider value="dark">
      <PortalComponent />
    </ThemeContext.Provider>
  );
};

const PortalComponent = () => {
  const theme = useContext(ThemeContext);  // ✅ 可以获取到 "dark"
  
  return createPortal(
    <div>当前主题: {theme}</div>,
    document.body
  );
};
```

### CSS 样式影响

| 样式类型     | 是否影响 Portal | 说明                                   |
| ------------ | --------------- | -------------------------------------- |
| **布局样式** | ❌ 不影响        | overflow、transform、position、z-index |
| **全局样式** | ✅ 影响          | 全局 CSS、CSS-in-JS、Tailwind 类       |
| **继承样式** | ⚠️ 部分影响      | 继承目标节点的样式，不继承父组件       |

```jsx
const Parent = () => {
  return (
    <div style={{ 
      fontSize: '20px',          // ❌ Portal 不会继承
      color: 'red',              // ❌ Portal 不会继承
      overflow: 'hidden',        // ✅ Portal 不受影响
      transform: 'scale(1.2)'    // ✅ Portal 不受影响
    }}>
      <PortalContent />
    </div>
  );
};
```

```css
/* 全局 CSS */
.global-class {
  background: blue;  /* ✅ Portal 中的元素会应用 */}

/* Tailwind */
<div className="text-red-500">  {/* ✅ Portal 中有效 */}
```

---

## 7. 常见使用场景

### 1. 模态框（Modal）

```jsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <button onClick={onClose}>关闭</button>
        {children}
      </div>
    </div>,
    document.body
  );
};

// CSS
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

### 2. 提示框（Tooltip）

```jsx
const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.bottom + 5 });
    setIsVisible(true);
  };
  
  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      
      {isVisible && createPortal(
        <div 
          className="tooltip"
          style={{ 
            position: 'fixed', 
            left: position.x, 
            top: position.y 
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
};
```

### 3. 全局通知（Notification）

```jsx
const NotificationPortal = ({ message, type }) => {
  return createPortal(
    <div className={`notification notification-${type}`}>
      {message}
    </div>,
    document.getElementById('notification-root')
  );
};

// CSS
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 8px;
  z-index: 9999;
}
```

### 4. 下拉菜单（Dropdown）

```jsx
const Dropdown = ({ items, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.bottom });
    }
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      <button ref={buttonRef} onClick={handleToggle}>
        {children}
      </button>
      
      {isOpen && createPortal(
        <div 
          className="dropdown-menu"
          style={{ 
            position: 'fixed', 
            left: position.x, 
            top: position.y 
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="dropdown-item">
              {item}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
```

---

## 8. 生产级最佳实践

### 1. 防御性检查目标节点

```jsx
const SafePortal = ({ children, targetId }) => {
  const targetElement = document.getElementById(targetId);
  
  if (!targetElement) {
    console.error(`Portal target "${targetId}" not found`);
    return null;  // 或者渲染到当前位置
  }
  
  return createPortal(children, targetElement);
};
```

### 2. 使用 useRef 缓存 DOM 节点

```jsx
const Portal = ({ children, targetId }) => {
  const targetRef = useRef(null);
  
  useEffect(() => {
    targetRef.current = document.getElementById(targetId);
  }, [targetId]);
  
  if (!targetRef.current) return null;
  
  return createPortal(children, targetRef.current);
};
```

### 3. 动态创建 Portal 容器

```jsx
const usePortal = (id) => {
  const portalRef = useRef(null);
  
  useEffect(() => {
    // 查找或创建容器
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }
    portalRef.current = element;
    
    // 清理函数
    return () => {
      if (portalRef.current && portalRef.current.childNodes.length === 0) {
        portalRef.current.remove();
      }
    };
  }, [id]);
  
  return portalRef.current;
};

// 使用
const Modal = ({ children }) => {
  const portalNode = usePortal('modal-root');
  
  if (!portalNode) return null;
  
  return createPortal(children, portalNode);
};
```

### 4. 焦点管理和键盘导航

```jsx
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // 保存之前的焦点元素
    const previousActiveElement = document.activeElement;
    
    // 聚焦模态框
    modalRef.current?.focus();
    
    // ESC 键关闭
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // 恢复之前的焦点
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div
      ref={modalRef}
      tabIndex={-1}
      className="modal-overlay"
    >
      {children}
    </div>,
    document.body
  );
};
```

### 5. 防止 body 滚动

```jsx
const Modal = ({ isOpen, children }) => {
  useEffect(() => {
    if (isOpen) {
      // 禁用 body 滚动
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // 恢复滚动
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
};
```

---

## 9. 常见问题与误区

### ❓ Q1: Portal 中的事件能冒泡到父组件吗？

**A: ✅ 能！** 这是 Portal 最重要的特性。

事件冒泡按照 **React 组件树** 而非 DOM 树，所以即使 DOM 节点在其他位置，事件仍然会冒泡到 React 父组件。

### ❓ Q2: Portal 解决的是什么问题？

**A: DOM 层级问题。**

Portal 让你可以将内容渲染到任意 DOM 位置，突破父容器的 CSS 限制（overflow、z-index、transform 等），同时保持 React 组件的逻辑关系。

### ❓ Q3: 什么时候不需要使用 Portal？

**A: 当组件不需要突破父容器限制时。**

例如：
- 简单的内联提示
- 不需要独立层级的弹出内容
- 组件始终在父容器范围内显示

### ❓ Q4: Portal 中能使用 Context 吗？

**A: ✅ 能！**

Context 是按照 React 组件树传递的，Portal 不影响 Context 的访问。

### ❓ Q5: Portal 的内容会继承父组件的 CSS 样式吗？

**A: 不会继承父组件样式，但会受全局样式影响。**

- ❌ 不继承：父组件的 fontSize、color 等继承属性
- ✅ 受影响：全局 CSS、CSS-in-JS、Tailwind 类
- ✅ 不受限：父组件的 overflow、transform、z-index

### ❓ Q6: 目标 DOM 节点不存在会怎样？

**A: 会报错。**

React 会警告：`Target container is not a DOM element.`

建议做防御性检查：

```jsx
const portal = document.getElementById('portal-root');
if (!portal) {
  console.error('Portal target not found');
  return null;
}
return createPortal(children, portal);
```

### ❓ Q7: 可以在 SSR 中使用 Portal 吗？

**A: 需要谨慎。**

服务端渲染时没有 DOM，需要确保 Portal 只在客户端渲染：

```jsx
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return createPortal(children, document.body);
};
```

---

## 10. 完整示例

### 实战：可复用的模态框组件

```jsx
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  const modalRef = useRef(null);
  
  // 焦点管理和键盘事件
  useEffect(() => {
    if (!isOpen) return;
    
    const previousActiveElement = document.activeElement;
    modalRef.current?.focus();
    
    // ESC 关闭
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // 禁用 body 滚动
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button 
            onClick={onClose}
            className="modal-close"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// 使用示例
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        打开模态框
      </button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="确认操作"
      >
        <p>你确定要执行这个操作吗？</p>
        <div className="modal-actions">
          <button onClick={() => setIsModalOpen(false)}>
            取消
          </button>
          <button onClick={() => {
            console.log('确认');
            setIsModalOpen(false);
          }}>
            确认
          </button>
        </div>
      </Modal>
    </div>
  );
};
```

### CSS 样式

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

---

## 总结

### Portal 的核心要点

1. **设计目的**：突破 CSS 限制 + 保持 React 逻辑
2. **两个身份**：DOM 在别处，React 组件树在原处
3. **事件冒泡**：按照 React 组件树，不是 DOM 树
4. **Context 可用**：Portal 不影响 Context 访问
5. **样式独立**：不继承父组件样式，但受全局样式影响

### 使用场景

- ✅ 模态框、对话框
- ✅ 悬浮提示、工具提示
- ✅ 下拉菜单、弹出菜单
- ✅ 全局通知、消息提示
- ✅ 全屏加载、遮罩层

### 最佳实践

1. 防御性检查目标节点是否存在
2. 使用 useRef 缓存 DOM 引用
3. 管理焦点和键盘导航
4. 控制 body 滚动
5. 提供清理函数
6. SSR 时确保只在客户端渲染

---

**记住：Portal 不是魔法，而是 React 提供的一个优雅解决方案，让你能在保持组件逻辑清晰的同时，灵活控制 DOM 渲染位置。**

