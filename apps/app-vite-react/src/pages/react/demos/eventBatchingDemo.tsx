import { useState } from "react";

export default function Batch() {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => {
        setCount((n) => n + 1);
        setCount((n) => n + 1);
        setCount((n) => n + 1);
      }}
    >
      函数式更新 +3：{count}
    </button>
  );
}
