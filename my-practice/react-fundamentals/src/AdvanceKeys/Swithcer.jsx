import { useState } from "react";

export const Switcher = () => {
  const [sw, setSw] = useState(false);

  return (
    <div>
      {sw ? (
        <span
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "20px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          Dark
        </span>
      ) : (
        <span
          style={{
            backgroundColor: "#e2e8f0",
            color: "black",
            padding: "20px",
            borderRadius: "5px",
            margin: "10px",
          }}
        >
          Light
        </span>
      )}

      <br />
      <input
        type="text"
        style={{ border: "4px solid gray", borderRadius: "5px" }}
        key={sw ? "dark" : "light"}
      />
      <button onClick={() => setSw((s) => !s)}>Switch</button>
    </div>
  );
};
