import { useState } from "react";
import styles from "./App.module.css";

export function App({ basePath = "/" }: { basePath?: string }) {
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  return (
    <main className={styles.app}>
      <div className={styles.eyebrow}>MICRO FRONTEND / 7104</div>
      <h1>Module Federation 子应用</h1>
      <p className={styles.lead}>运行时远程模块与共享依赖</p>
      <nav aria-label="子应用导航" className={styles.tabs}>
        <button
          aria-pressed={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          应用概览
        </button>
        <button
          aria-pressed={tab === "details"}
          onClick={() => setTab("details")}
        >
          交互演示
        </button>
      </nav>
      {tab === "overview" ? (
        <section className={styles.grid}>
          <article>
            <span>运行状态</span>
            <h2>已挂载</h2>
            <p>此页面由独立的 React 根节点渲染。</p>
          </article>
          <article>
            <span>主应用路径</span>
            <h2 className={styles.path}>{basePath}</h2>
            <p>可通过侧边栏切换到其他子应用。</p>
          </article>
        </section>
      ) : (
        <section className={styles.panel}>
          <h2>独立交互状态</h2>
          <p>
            计数：<strong>{count}</strong>
          </p>
          <button onClick={() => setCount((value) => value + 1)}>
            增加计数
          </button>
          <button onClick={() => setCount(0)}>重置</button>
          <label>
            备注
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="输入内容验证子应用交互"
            />
          </label>
          <p>{note || "暂无备注"}</p>
          <small>切换侧边栏会卸载本应用，重新进入时交互状态重置。</small>
        </section>
      )}
    </main>
  );
}
