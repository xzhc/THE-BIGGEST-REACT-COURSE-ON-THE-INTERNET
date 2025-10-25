import { useEffect, useState } from "react";

export const CounterEffect = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `title${count}`;
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>increment</button>
    </div>
  );
};
