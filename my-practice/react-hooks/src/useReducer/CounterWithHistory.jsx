import { useReducer } from "react";

//implement with useState
// export function CounterWithHistory() {
//   const [count, setCount] = useState(0);
//   const [history, setHistory] = useState([0]);
//   const [historyIndex, setHistoryIndex] = useState(0);

//   const increment = () => {
//     //console.log("before decrement:", { count, history, historyIndex });
//     const newCount = count + 1;
//     setCount(newCount);
//     const newHistory = [...history.slice(0, historyIndex + 1), newCount];
//     //console.log("New History:", newHistory);
//     setHistory(newHistory);
//     setHistoryIndex(newHistory.length - 1);
//   };

//   const decrement = () => {
//     // console.log("before decrement:", { count, history, historyIndex });
//     const newCount = count - 1;
//     setCount(newCount);
//     const newHistory = [...history.slice(0, historyIndex + 1), newCount];
//     // console.log("New History:", newHistory);
//     setHistory(newHistory);
//     setHistoryIndex(newHistory.length - 1);
//   };

//   const reset = () => {
//     const newCount = 0;
//     setCount(newCount);
//     const newHistory = [...history.slice(0, historyIndex + 1), newCount];
//     setHistory(newHistory);
//     setHistoryIndex(newHistory.length - 1);
//   };

//   const undo = () => {
//     if (historyIndex > 0) {
//       setHistoryIndex(historyIndex - 1);
//       setCount(history[historyIndex - 1]);
//     }
//   };

//   const redo = () => {
//     if (historyIndex < history.length - 1) {
//       setHistory(historyIndex + 1);
//       setCount(history[historyIndex + 1]);
//     }
//   };

//   return (
//     <div>
//       <h1>Counter with History</h1>
//       <h2>The number is:{count}</h2>
//       <button onClick={increment}>+1</button>
//       <button onClick={decrement}>-1</button>
//       <button onClick={reset}>Reset</button>
//       <button onClick={undo} disabled={historyIndex === 0}>
//         ⬅️ Undo
//       </button>
//       <button onClick={redo} disabled={historyIndex === history.length - 1}>
//         ➡️ Redo
//       </button>
//       <h2>History</h2>
//       <div>
//         {history.join(",")}
//         {history.map((value, index) => {
//           return (
//             <p key={index}>
//               Step {index}:{value}
//             </p>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

//implement it with useReducer
const ACTIONS = {
  INCREMENT: "increment",
  DECREMENT: "decrement",
  RESET: "reset",
  UNDO: "undo",
  REDO: "redo",
};

const initialState = {
  count: 0,
  history: [0],
  historyIndex: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.INCREMENT: {
      const newCount = state.count + 1;
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        newCount,
      ];

      return {
        count: newCount,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case ACTIONS.DECREMENT: {
      const newCount = state.count - 1;
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        newCount,
      ];

      return {
        count: newCount,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case ACTIONS.RESET: {
      const newCount = 0;
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        newCount,
      ];

      return {
        count: newCount,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case ACTIONS.UNDO: {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          count: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case ACTIONS.REDO: {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          count: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }

    default:
      return state;
  }
}
export function CounterWithHistory() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { count, history, historyIndex } = state;

  return (
    <div>
      <h1>Counter With History</h1>
      <h2>The number is: {count}</h2>
      <button onClick={() => dispatch({ type: ACTIONS.INCREMENT })}>+1</button>
      <button onClick={() => dispatch({ type: ACTIONS.DECREMENT })}>-1</button>
      <button onClick={() => dispatch({ type: ACTIONS.RESET })}>Reset</button>
      <button
        onClick={() => dispatch({ type: ACTIONS.UNDO })}
        disabled={historyIndex === 0}
      >
        ⬅️ Undo
      </button>
      <button
        onClick={() => dispatch({ type: ACTIONS.REDO })}
        disabled={historyIndex === history.length - 1}
      >
        ➡️ Redo
      </button>
      <h2>{history.join(",")}</h2>
      {history.map((value, index) => {
        return (
          <p key={index}>
            Step{index}:{value}
          </p>
        );
      })}
    </div>
  );
}
