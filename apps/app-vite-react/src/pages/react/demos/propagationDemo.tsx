import { useState } from "react";

export default function PropagationDemo() {
  const [stop, setStop] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const append = (text: string) =>
    setLog((items) => [...items, text].slice(-12));
  return (
    <div className="rh-demo">
      <div>
        <span className="rh-kicker">试一试 · 事件传播</span>
        <h3>看见一次点击的传播路径。</h3>
      </div>
      <label className="rh-checkbox">
        <input
          type="checkbox"
          checked={stop}
          onChange={(e) => setStop(e.target.checked)}
        />
        在按钮处停止冒泡
      </label>
      <div
        className="rh-event-parent"
        onClickCapture={() => append("① 父级捕获")}
        onClick={() => append("③ 父级冒泡")}
      >
        <span>父级容器</span>
        <button
          type="button"
          onClick={(event) => {
            if (stop) event.stopPropagation();
            append(stop ? "② 按钮（已停止冒泡）" : "② 按钮");
          }}
        >
          点击这个按钮
        </button>
      </div>
      <div className="rh-event-log" role="log" aria-label="事件执行顺序">
        {log.length ? (
          log.map((item, index) => <span key={index}>{item}</span>)
        ) : (
          <span>点击按钮，观察捕获 → 目标 → 冒泡。</span>
        )}
      </div>
      <button
        className="rh-quiet-button"
        type="button"
        onClick={() => setLog([])}
      >
        清空记录
      </button>
    </div>
  );
}
