import { useEffect, useRef, useState } from "react";

export function SimpleExample() {
  //用法一： 直接访问组件
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  //用法二：存储不触发渲染的变量
  const renderCount = useRef(0);

  const [name, setName] = useState("");

  useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <>
      <h2>useRef使用实例</h2>
      <input
        ref={inputRef}
        placeholder="点击按钮我会聚焦"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={focusInput}>聚焦</button>

      <p>组件渲染次数：{renderCount.current}</p>
      <p>当前姓名：{name}</p>
      <button onClick={() => setName(name + "🐶")}>添加狗狗</button>
    </>
  );
}
