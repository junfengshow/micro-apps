import { useState } from "react";

export default function AutomaticBatch() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  return (
    <button
      onClick={() => {
        setTimeout(() => {
          setCount((n) => n + 1);
          setFlag((value) => !value);
          // React 18+ createRoot：这两个更新可在同一批次处理。
          // 不能在这里立即读取新 DOM，也不能用旧 count 判断提交结果。
        }, 100);
      }}
    >
      {count} / {String(flag)}
    </button>
  );
}
