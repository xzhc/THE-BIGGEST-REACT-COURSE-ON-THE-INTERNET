import { useState } from "react";

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((prev) => !prev);

  // 返回数组，符合 React Hooks 的约定（类似 useState）
  return [value, toggle];
}
