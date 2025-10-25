import { useEffect, useState } from "react";

export const BasicEffect = () => {
  const [count, setCount] = useState(0);

  useEffect(() => console.log("component mount!"), []);
  return (
    <>
      <h2>Basic Effect</h2>
      <p>{count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>increment</button>
    </>
  );
};
