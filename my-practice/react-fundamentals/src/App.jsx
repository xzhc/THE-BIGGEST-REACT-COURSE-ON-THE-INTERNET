import { Counter } from "./State/Counter";
import { Profile } from "./State/Profile";
import { ShoppingList } from "./State/ShoppingList";
import { TodoList } from "./State/TodoList";

const App = () => {
  return (
    <div>
      <Counter />
      <TodoList />
      <Profile />
      <ShoppingList />
    </div>
  );
};

export default App;
