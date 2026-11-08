import { useReducer } from "react";

function reducer(state: { count: number }, action: { type: "add" | "reset" }) {
  switch (action.type) {
    case "add":
      return { count: state.count + 1 };
    case "reset":
      return { count: 0 };
    default:
      return state;
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <button onClick={() => dispatch({ type: "add" })}>
        {state.count} + 1
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </>
  );
}
