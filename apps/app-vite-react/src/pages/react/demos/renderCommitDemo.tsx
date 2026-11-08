import { useState } from "react";

export default function RenderDemo() {
  const [count, setCount] = useState(0);
  return (
    <section>
      <h2>这段静态标题无需每次重建 DOM</h2>
      <button onClick={() => setCount((n) => n + 1)}>次数：{count}</button>
    </section>
  );
}
