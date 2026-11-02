import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

export function StateDemo() {
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

export function EventDemo() {
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "正在保存…" : "保存学习目标 →"}
    </button>
  );
}

export function FormDemo() {
  const id = useId();
  const [message, action, pending] = useActionState(
    async (_previous: string, data: FormData) => {
      const goal = String(data.get("goal") || "").trim();
      if (!goal) return "请先填写一个学习目标。";
      await new Promise((resolve) => setTimeout(resolve, 800));
      return `已完成本地模拟保存：${goal}`;
    },
    ""
  );
  return (
    <div className="rh-demo">
      <div>
        <span className="rh-kicker">试一试 · React 19 表单</span>
        <h3>两个 Hook，让提交状态各就其位。</h3>
      </div>
      <p>
        useActionState 保存结果，表单内部的按钮通过 useFormStatus 读取
        pending。数据仅在本页演示。
      </p>
      <form action={action} className="rh-demo-form" aria-busy={pending}>
        <label htmlFor={id}>我的下一个学习目标</label>
        <div>
          <input
            id={id}
            name="goal"
            placeholder="例如：理解 useEffect 的清理"
            required
            maxLength={100}
            disabled={pending}
          />
          <SubmitButton />
        </div>
        <p className="rh-form-message" role="status">
          {pending
            ? "模拟请求中，观察按钮的 pending 状态…"
            : message || "填写目标并提交，查看 Action 的返回结果。"}
        </p>
      </form>
    </div>
  );
}
