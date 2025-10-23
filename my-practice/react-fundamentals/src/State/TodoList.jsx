import { useState } from "react";

export function TodoList() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const addNewTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      setItems((prev) => [...prev, inputValue]);
      setInputValue("");
    }
  };

  return (
    <div>
      <form onSubmit={addNewTodo}>
        <label>add new todo</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Please input your todo"
        ></input>
        <button type="submit">Add a new todo</button>
      </form>
      <ul>
        {items.map((item, index) => {
          return <li key={index}>{item}</li>;
        })}
      </ul>
    </div>
  );
}
