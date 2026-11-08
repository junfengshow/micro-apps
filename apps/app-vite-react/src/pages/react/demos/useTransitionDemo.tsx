import { memo, useId, useState, useTransition } from "react";

const ROW_RENDER_MS = 0.5;

function SlowResult({ query, index }: { query: string; index: number }) {
  // 故意让每一行渲染变慢；React 可以在组件之间让出执行权。
  // 不要把整段耗时循环放进事件处理器或 startTransition 回调。
  const start = performance.now();
  while (performance.now() - start < ROW_RENDER_MS) {
    // 仅用于模拟复杂列表项的同步渲染成本。
  }

  return (
    <div style={{ padding: "4px 0", borderBottom: "1px solid #dfe7e3" }}>
      {query} · 结果 {index + 1}
    </div>
  );
}

const SlowResults = memo(function SlowResults({
  query,
  rowCount,
}: {
  query: string;
  rowCount: number;
}) {
  if (!query) {
    return <p>输入关键词后，渲染 {rowCount} 条模拟结果。</p>;
  }

  return (
    <>
      <p>
        列表关键词：<strong>{query}</strong>（{rowCount} 条）
      </p>
      {Array.from({ length: rowCount }, (_, index) => (
        <SlowResult key={index} query={query} index={index} />
      ))}
    </>
  );
});

function SearchDemo({
  withTransition,
  rowCount,
}: {
  withTransition: boolean;
  rowCount: number;
}) {
  const inputId = useId();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateSearch(value: string) {
    // 两组都立即更新受控输入框，唯一差别是列表更新的优先级。
    setText(value);
    if (withTransition) {
      startTransition(() => setQuery(value));
    } else {
      setQuery(value);
    }
  }

  return (
    <section
      style={{
        flex: "1 1 280px",
        minWidth: 0,
        padding: 16,
        border: "1px solid #dfe7e3",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <h4 style={{ margin: "0 0 8px" }}>
        {withTransition ? "使用 useTransition" : "未使用 useTransition"}
      </h4>
      <p style={{ margin: "0 0 12px" }}>
        {withTransition
          ? "输入优先回显，慢列表在可中断的过渡中更新。"
          : "输入与慢列表一起更新，输入回显会被渲染阻塞。"}
      </p>
      <label htmlFor={inputId}>连续输入或删除关键词</label>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        placeholder="试着连续输入 react"
        value={text}
        onChange={(event) => updateSearch(event.target.value)}
        style={{
          display: "block",
          boxSizing: "border-box",
          width: "100%",
          marginTop: 8,
          padding: "8px 12px",
          border: "1px solid #b9ccc5",
          borderRadius: 8,
          font: "inherit",
        }}
      />
      <p role="status" style={{ minHeight: "1.7em", margin: "8px 0" }}>
        {isPending
          ? "正在更新结果… 可继续输入，旧结果暂时保留。"
          : text
            ? "结果已更新"
            : "等待输入"}
      </p>
      <div
        aria-busy={isPending}
        style={{
          height: 220,
          overflow: "auto",
          opacity: isPending ? 0.5 : 1,
          borderTop: "1px solid #dfe7e3",
          overflowWrap: "anywhere",
        }}
      >
        {/* memo 让输入的紧急更新跳过关键词未变化的慢列表。 */}
        <SlowResults query={query} rowCount={rowCount} />
      </div>
      <pre style={{ overflowX: "auto", fontSize: 12, marginBottom: 0 }}>
        {withTransition
          ? "setText(value);\nstartTransition(() => setQuery(value));"
          : "setText(value);\nsetQuery(value);"}
      </pre>
    </section>
  );
}

export default function UseTransitionDemo() {
  const [rowCount, setRowCount] = useState(500);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>慢列表会不会拖慢输入？</h3>
        <p style={{ margin: "0 0 12px" }}>
          分别在两个输入框中快速输入同样的内容，比较文字回显的流畅度。
          每行故意增加约 {ROW_RENDER_MS}ms 的渲染耗时；差异不明显时可增加行数。
        </p>
        <label>
          渲染量：
          <select
            value={rowCount}
            onChange={(event) => setRowCount(Number(event.target.value))}
            style={{ padding: 4, font: "inherit" }}
          >
            <option value={200}>200 行（约 100ms）</option>
            <option value={500}>500 行（约 250ms）</option>
            <option value={1000}>1000 行（约 500ms）</option>
            <option value={10000}>10000 行（约 2000ms）</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <SearchDemo withTransition={false} rowCount={rowCount} />
        <SearchDemo withTransition rowCount={rowCount} />
      </div>
      <p style={{ margin: 0 }}>
        useTransition 不会让计算本身变快，也不会创建后台线程。它让 React
        优先处理输入，并在新输入到来时中断、重做尚未完成的列表渲染。
        startTransition 回调仍同步执行，因此这里只在回调内更新列表状态。
        实际耗时受设备性能和开发模式影响；大量 DOM 的最终提交仍可能造成卡顿。
      </p>
    </div>
  );
}
