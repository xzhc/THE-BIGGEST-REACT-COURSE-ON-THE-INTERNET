import { useState } from "react";

export function Counter() {
  const [number, setNumber] = useState(0);
  const increment = () => {
    setNumber((prev) => prev + 1);
  };

  const decrement = () => {
    setNumber((prev) => prev - 1);
  };
  return (
    <div>
      <p>The number is {number}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}
