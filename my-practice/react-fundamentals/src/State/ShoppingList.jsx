import { useState } from "react";

export function ShoppingList() {
  const [commodities, setCommodities] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");

  const addCommodity = (e) => {
    e.preventDefault();
    setCommodities((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: itemName,
        quantity: Number(itemQuantity),
      },
    ]);

    setItemName("");
    setItemQuantity("");
  };

  return (
    <div>
      <form onSubmit={addCommodity}>
        <label>
          commodity name:
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </label>

        <label>
          commodity numbers:
          <input
            type="text"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
          />
        </label>

        <button type="submit">Add</button>
      </form>

      {commodities.length > 0 && (
        <ul>
          {commodities.map((item) => (
            <li key={item.id}>
              {item.name} -- Quantity:{item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
