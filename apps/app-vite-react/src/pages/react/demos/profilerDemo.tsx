import { Profiler, useState } from "react";
import type { ProfilerOnRenderCallback } from "react";

const report: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  console.info(id, phase, actualDuration.toFixed(2) + "ms");
};

export default function MeasuredCounter() {
  const [count, setCount] = useState(0);
  return (
    <Profiler id="counter" onRender={report}>
      <button onClick={() => setCount((n) => n + 1)}>{count}</button>
    </Profiler>
  );
}
