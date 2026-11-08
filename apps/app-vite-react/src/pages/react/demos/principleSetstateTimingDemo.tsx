import { useEffect, useState } from "react";

export default function Snapshot() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("本次已提交的 count：", count);
  }, [count]);
  return (
    <button
      onClick={() => {
        const nextCount = count + 1;
        setCount(nextCount);
        console.log("旧快照 / 计算出的下一值：", count, nextCount);
        setTimeout(() => console.log("仍是旧闭包：", count), 0);
      }}
    >
      {count}
    </button>
  );
}
