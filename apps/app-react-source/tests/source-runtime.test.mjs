import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { JSDOM } from "jsdom";

// 直接从官方构建目录解析包，验证 React 和 DOM 使用同一个本地 React 实例。
const require = createRequire(
  new URL(
    "../vendor/react/build/node_modules/react-dom/client.js",
    import.meta.url
  )
);
const React = require("react");

test("源码日志、useState 更新、effect 清理和卸载均使用本地产物", async () => {
  assert.equal(React.version, "19.3.0");
  assert.match(
    require.resolve("react"),
    /vendor\/react\/build\/node_modules\/react\//
  );
  assert.match(
    require.resolve("scheduler"),
    /vendor\/react\/build\/node_modules\/scheduler\//
  );
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost:7105",
  });
  const loggerNames = [
    "Logger",
    "MainLogger",
    "EventsLogger",
    "SchedulerLogger",
    "RenderLogger",
    "CommitLogger",
    "HooksLogger",
  ];
  const previous = Object.fromEntries(
    ["window", "document", "IS_REACT_ACT_ENVIRONMENT", ...loggerNames].map(
      (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]
    )
  );
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));
  // 允许在 React 源码中直接使用与页面一致的全局阶段日志。
  const logger = Object.fromEntries(
    ["log", "info", "debug", "warn", "error", "step", "tag", "line"].map(
      (method) => [method, (...args) => console.log(...args)]
    )
  );
  for (const name of loggerNames) {
    dom.window[name] = logger;
    globalThis[name] = logger;
  }
  let root;
  let effects = 0;
  let cleanups = 0;
  function Counter() {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      effects++;
      return () => {
        cleanups++;
      };
    }, [count]);
    return React.createElement(
      "button",
      { onClick: () => setCount((value) => value + 1) },
      count
    );
  }
  try {
    // DOM 模块初始化时会探测 window/document，必须在 jsdom 全局就绪后加载。
    const { createRoot } = require("react-dom/client");
    const { flushSync } = require("react-dom");
    const container = document.getElementById("root");
    await React.act(() => {
      root = createRoot(container);
      root.render(React.createElement(Counter));
    });
    assert.ok(
      logs.some((line) =>
        line.includes("[react-source] createRoot · React v19.3.0")
      ),
      "应执行写在 ReactDOMRoot.js 中的源码日志"
    );
    assert.equal(container.textContent, "0");
    await React.act(() => {
      container
        .querySelector("button")
        .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    });
    assert.equal(container.textContent, "1");
    assert.equal(effects, 2);
    assert.equal(cleanups, 1);
    await React.act(() => {
      flushSync(() => root.unmount());
    });
    root = undefined;
    assert.equal(container.textContent, "");
    assert.equal(cleanups, 2);
  } finally {
    if (root) await React.act(() => root.unmount());
    console.log = originalLog;
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});

const production = new URL(
  "../vendor/react/build/node_modules/react-dom/cjs/react-dom-client.production.js",
  import.meta.url
);
test("生产产物移除示例开发日志", { skip: !existsSync(production) }, () => {
  assert.ok(
    !readFileSync(production, "utf8").includes("[react-source] createRoot")
  );
});
