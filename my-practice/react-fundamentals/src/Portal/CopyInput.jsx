import { useState } from "react";
import { PopupContent } from "./PopupContent";

export const CopyInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(inputValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div style={{ position: "relative", marginTop: "6rem" }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border-2"
      />
      <button onClick={handleCopy}>Copy</button>
      <PopupContent copied={copied} />
    </div>
  );
};
