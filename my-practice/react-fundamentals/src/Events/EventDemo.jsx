import { useState } from "react";

export function EventDemo() {
  const [buttonText, setButtonText] = useState("Initial Button Text");
  const [copyText, setCopyText] = useState("Initial text");
  const [backgroundColor, setBackgroundColor] = useState("");
  function buttonHandler() {
    setButtonText("Button Clicked!");
  }

  function copyHandler() {
    setCopyText("Text Copied!");
  }

  function handleMouseOver() {
    setBackgroundColor("lightyellow");
  }

  return (
    <div>
      <button onClick={buttonHandler}>click</button>
      <p>{buttonText}</p>

      <div>
        <p onCopy={copyHandler}>{copyText}</p>
      </div>

      <div>
        <p
          style={{ backgroundColor: backgroundColor }}
          onMouseOver={handleMouseOver}
        >
          some text
        </p>
      </div>
    </div>
  );
}
