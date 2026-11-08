import { useState } from "react";

export default function Queue() {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => {
        setCount(5); // 队列结果：5
        setCount((n) => n + 1); // 队列结果：6
        setCount((n) => n * 2); // 队列结果：12
        console.log(count); // 第一次点击仍为 0
      }}
    >
      下一状态：{count}
    </button>
  );
}
