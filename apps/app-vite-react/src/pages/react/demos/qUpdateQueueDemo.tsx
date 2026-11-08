import { useState } from "react";
export default function Queue() {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => {
        setCount((n) => n + 1);
        setCount(5);
        setCount((n) => n + 1);
      }}
    >
      结果：{count}
    </button>
  );
}
