import { useEffect, useState, version } from "react";

export function App() {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  return (
    <main>
      <header>
        <span className="eyebrow">REACT SOURCE LAB / 19.3.0</span>
        <h1>从源码，看见一次渲染。</h1>
        <p>
          修改本地 React 源码，手动编译，再重启 Vite。打开开发者工具
          Console，观察源码中的日志。
        </p>
      </header>
      <section className="metadata">
        <div>
          <small>运行时版本</small>
          <strong>React {version}</strong>
        </div>
        <div>
          <small>源码标签</small>
          <strong>{__REACT_SOURCE_BUILD__.tag}</strong>
        </div>
        <div>
          <small>最近一次编译</small>
          <strong>
            {new Date(__REACT_SOURCE_BUILD__.compiledAt).toLocaleString()}
          </strong>
        </div>
      </section>
      <section>
        <h2>01 / 触发更新</h2>
        <p>
          在 ReactHooks.js 的 useState 或 ReactFiberHooks.js 的 dispatchSetState
          中添加日志，再点击按钮。
        </p>
        <div className="controls">
          <button onClick={() => setCount((value) => value + 1)}>
            计数 +1 · {count}
          </button>
          <button className="secondary" onClick={() => setCount(0)}>
            重置
          </button>
          <button
            className="secondary"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? "卸载" : "挂载"} Effect 示例
          </button>
        </div>
        {visible && <EffectExample count={count} />}
      </section>
      <section>
        <h2>02 / 修改 → 编译 → 重启</h2>
        <p>
          源码位于当前应用的 <code>vendor/react/packages/</code>，已在
          ReactDOMRoot.js 的 createRoot 中加入一条示例日志：
        </p>
        <pre>[react-source] createRoot · React v19.3.0</pre>
        <p>停止当前开发服务，然后在应用目录执行：</p>
        <pre>{"npm run react:build\nnpm run dev"}</pre>
        <p>
          刷新页面即可看到新的日志。开发模式使用 NODE_DEV 产物；生产构建会移除
          __DEV__ 分支中的日志。
        </p>
      </section>
    </main>
  );
}

function EffectExample({ count }: { count: number }) {
  useEffect(() => {
    console.log("[demo] effect", count);
    return () => console.log("[demo] effect cleanup", count);
  }, [count]);
  return (
    <p className="effect">
      Effect 示例已挂载，当前计数 {count}。更新或卸载时可在 Console 查看 effect
      / cleanup。
    </p>
  );
}
