import { CounterWithHistory } from "./useReducer/CounterWithHistory";
import { CounterWithReducer } from "./useReducer/CounterWithReducer";
import { CounterWithState } from "./useReducer/CounterWithState";

function App() {
  return (
    <>
      <CounterWithState />
      <CounterWithReducer />
      <CounterWithHistory />
    </>
  );
}

export default App;
