import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((n) => n + 1)}>已点击 {count} 次</button>
  );
}

function StateSnapshotDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="rh-demo">
      <div>
        <span className="rh-kicker">试一试 · 状态快照</span>
        <h3>同样调用三次，结果为什么不同？</h3>
      </div>
      <output className="rh-demo-count" aria-live="polite">
        {count}
      </output>
      <div className="rh-demo-actions">
        <button
          type="button"
          onClick={() => {
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
          }}
        >
          快照更新 × 3（+1）
        </button>
        <button
          type="button"
          onClick={() => {
            setCount((n) => n + 1);
            setCount((n) => n + 1);
            setCount((n) => n + 1);
          }}
        >
          函数更新 × 3（+3）
        </button>
        <button
          className="rh-quiet-button"
          type="button"
          onClick={() => setCount(0)}
        >
          重置
        </button>
      </div>
      <p>前者三次传入同一个值；后者让三次更新依次消费前一个结果。</p>
    </div>
  );
}

export default function UseStateDemo() {
  return (
    <section>
      <h4>基础计数</h4>
      <Counter />
      <StateSnapshotDemo />
    </section>
  );
}
