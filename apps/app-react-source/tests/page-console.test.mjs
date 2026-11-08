import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { build, stop } from "esbuild";
import { JSDOM } from "jsdom";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
after(() => stop());
const fixtures = [
  [
    "page-console",
    'export { snapshotArguments } from "./src/console/snapshot"; export { createLogStore, logLevels } from "./src/console/store"; export { installLogCapture, loggerScopes } from "./src/console/capture"; export { mountLogView } from "./src/console/view";',
  ],
  [
    "page-demo",
    'export { mount, unmount } from "./src/bootstrap"; export { act } from "react";',
  ],
  ["page-main", 'import "./src/main";'],
];
const aliases = Object.fromEntries(
  [
    ["react", "react/index.js"],
    ["react/jsx-runtime", "react/jsx-runtime.js"],
    ["react/jsx-dev-runtime", "react/jsx-dev-runtime.js"],
    ["react-dom", "react-dom/index.js"],
    ["react-dom/client", "react-dom/client.js"],
    ["scheduler", "scheduler/index.js"],
  ].map(([name, path]) => [
    name,
    `${root}vendor/react/build/node_modules/${path}`,
  ])
);
await Promise.all(
  fixtures.map(([name, contents]) =>
    build({
      stdin: { contents, resolveDir: root, loader: "ts" },
      outfile: `${root}.cache/tests/${name}.cjs`,
      bundle: true,
      platform: "node",
      format: "cjs",
      alias: aliases,
      // 保留真实 Node 包边界，React.act 可直接使用 Node timers，避免被打包后退回 MessageChannel。
      external: Object.values(aliases),
      jsx: "automatic",
      jsxDev: true,
      loader: { ".css": "empty" },
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.hot": "undefined",
        __REACT_SOURCE_BUILD__: JSON.stringify({
          tag: "v19.3.0",
          compiledAt: "2026-11-02T00:00:00Z",
        }),
      },
    })
  )
);
const {
  snapshotArguments,
  createLogStore,
  logLevels,
  installLogCapture,
  loggerScopes,
  mountLogView,
} = require(`${root}.cache/tests/page-console.cjs`);
function property(snapshot, key) {
  return snapshot.children.find((child) => child.key === key).value;
}
function expandAll(window, container) {
  for (let depth = 0; depth < 8; depth++) {
    for (const details of container.querySelectorAll("details:not([open])")) {
      details.open = true;
      details.dispatchEvent(new window.Event("toggle"));
    }
  }
}
function createWindow() {
  const dom = new JSDOM(
    '<div id="app-react-source-root"></div><aside id="logs"></aside>',
    { url: "http://localhost:7105/" }
  );
  const nativeCalls = [];
  for (const level of logLevels)
    dom.window.console[level] = (...args) => nativeCalls.push({ level, args });
  return {
    dom,
    window: dom.window,
    container: dom.window.document.getElementById("logs"),
    nativeCalls,
  };
}

test("快照脱离原始引用：嵌套对象、数组、Map、Set、Error 和循环引用", () => {
  let getters = 0;
  const data = {
    nested: { name: "before" },
    items: [{ value: 1 }],
    map: new Map([["key", { value: 1 }]]),
    set: new Set([1]),
    error: new Error("before"),
    bigint: 1n,
  };
  data.self = data;
  Object.defineProperty(data, "getter", {
    enumerable: true,
    get() {
      getters++;
      throw new Error("不应执行 getter");
    },
  });
  const snapshot = snapshotArguments([data])[0];
  const saved = JSON.stringify(snapshot);
  data.nested.name = "after";
  data.items[0].value = 2;
  data.items.push({ value: 3 });
  data.map.get("key").value = 2;
  data.set.add(2);
  data.error.message = "after";
  assert.equal(JSON.stringify(snapshot), saved);
  assert.equal(property(property(snapshot, "nested"), "name").label, "before");
  assert.equal(property(snapshot, "items").label, "Array(1)");
  assert.equal(
    property(property(snapshot, "map"), "0.value").children[0].value.label,
    "1"
  );
  assert.equal(property(snapshot, "set").label, "Set(1)");
  assert.equal(property(snapshot, "error").label, "Error: before");
  assert.equal(property(snapshot, "bigint").label, "1n");
  assert.match(property(snapshot, "self").label, /↩/);
  assert.equal(getters, 0);
  assert.match(property(snapshot, "getter").label, /未执行/);
});

test("类型标签覆盖自定义类、普通对象 Fiber、FiberRoot、Hook，类型识别不调用 getter", () => {
  class ExampleState {
    value = 1;
  }
  class FiberNode {}
  const fiber = {
    tag: 0,
    flags: 0,
    lanes: 1,
    childLanes: 0,
    return: null,
    child: null,
    sibling: null,
    alternate: null,
    pendingProps: {},
    memoizedProps: {},
    memoizedState: null,
  };
  const root = {
    current: fiber,
    containerInfo: {},
    pendingLanes: 0,
    suspendedLanes: 0,
    pingCache: null,
    callbackNode: null,
  };
  const hook = {
    memoizedState: 0,
    baseState: 0,
    baseQueue: null,
    queue: {},
    next: null,
  };
  let getters = 0;
  const prototype = Object.create(null);
  Object.defineProperty(prototype, "constructor", {
    get() {
      getters++;
      throw new Error("禁止调用");
    },
  });
  const unknown = Object.create(prototype);
  const snapshots = snapshotArguments([
    new ExampleState(),
    new FiberNode(),
    fiber,
    root,
    hook,
    unknown,
    Object.create(null),
    { tag: 0 },
  ]);
  assert.deepEqual(
    snapshots.map((value) => value.label),
    [
      "ExampleState",
      "Fiber",
      "Fiber",
      "FiberRoot",
      "Hook",
      "Object",
      "Object",
      "Object",
    ]
  );
  assert.equal(getters, 0);
  const saved = JSON.stringify(snapshots);
  fiber.lanes = 2;
  ExampleState.prototype.constructor = class Changed {};
  assert.equal(JSON.stringify(snapshots), saved);
  assert.match(property(snapshots[3], "current").label, /↩ Fiber/);
});

test("大对象快照受限，读取失败不会中断日志，历史日志内存有界", () => {
  const large = Object.fromEntries(
    Array.from({ length: 10_000 }, (_, index) => [index, "x".repeat(3_000)])
  );
  const serialized = JSON.stringify(snapshotArguments([large]));
  assert.ok(serialized.length < 30_000);
  assert.match(serialized, /截断|展示/);
  const { proxy, revoke } = Proxy.revocable({}, {});
  revoke();
  assert.match(JSON.stringify(snapshotArguments([proxy])), /无法读取/);
  const store = createLogStore(2);
  for (let value = 0; value < 10; value++) store.append("log", "test", [value]);
  assert.deepEqual(
    store.entries.map((entry) => entry.values[0].label),
    ["8", "9"]
  );
});

test("精简日志页面延迟展开仍显示旧值，追加保留展开状态，文本不作为 HTML 执行", async () => {
  const { dom, window, container, nativeCalls } = createWindow();
  const original = window.console.log;
  const previousLogger = { info() {} };
  window.HooksLogger = previousLogger;
  const store = createLogStore();
  const stopCapture = installLogCapture(window, store);
  const stopView = mountLogView(container, store);
  try {
    const data = { nested: { message: "原始值" } };
    window.console.log("first", data);
    data.nested.message = "后续值";
    window.console.warn("second");
    window.console.error("third <img src=x onerror=alert(1)>");
    window.HooksLogger.info("fourth");
    await delay(70);
    expandAll(window, container);
    assert.match(container.textContent, /原始值/);
    assert.doesNotMatch(container.textContent, /后续值/);
    assert.equal(container.querySelector("img"), null);
    assert.equal(nativeCalls.length, 4);
    const firstObject = container.querySelector(".snapshot-object");
    window.console.log("fifth");
    await delay(70);
    assert.equal(container.querySelector(".snapshot-object"), firstObject);
    assert.equal(firstObject.open, true);
    assert.equal(container.querySelector("input, select, button"), null);
    assert.equal(
      container.querySelector(".log-meta, .log-level, .console-heading"),
      null
    );
    assert.equal(container.querySelectorAll(".log-entry").length, 5);
  } finally {
    stopView();
    stopCapture();
    stopCapture();
    assert.equal(window.console.log, original);
    assert.equal(window.HooksLogger, previousLogger);
    assert.equal(window.MainLogger, undefined);
    assert.equal(container.childElementCount, 0);
    dom.window.close();
  }
});

test("真实本地 React：页面仅显示版本和编译时间，真实 Fiber 显示类型且日志不触发 React 渲染", async () => {
  const { dom, window, container } = createWindow();
  const keys = [
    "window",
    "document",
    "Node",
    "Element",
    "console",
    "IS_REACT_ACT_ENVIRONMENT",
    ...Object.keys(loggerScopes),
  ];
  const previous = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
  );
  Object.assign(globalThis, {
    window,
    document: window.document,
    Node: window.Node,
    Element: window.Element,
    console: window.console,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  // 浏览器中的 window 属性同时是全局标识符；jsdom 需要显式映射。
  for (const name of Object.keys(loggerScopes)) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get: () => window[name],
    });
  }
  const store = createLogStore();
  const stopCapture = installLogCapture(window, store);
  const stopView = mountLogView(container, store);
  const app = require(`${root}.cache/tests/page-demo.cjs`);
  let mounted = false;
  try {
    await app.act(() => {
      app.mount();
      mounted = true;
    });
    assert.ok(
      store.entries.some((entry) =>
        entry.values[0]?.label.includes("[react-source] createRoot")
      )
    );
    const initialCount = store.entries.length;
    await delay(100);
    assert.equal(
      store.entries.length,
      initialCount,
      "显示日志不能触发新的 React 日志"
    );
    const metadata = document.querySelector(".runtime-info");
    assert.equal(metadata.children.length, 2);
    assert.match(metadata.textContent, /React 19\.3\.0/);
    assert.ok(metadata.querySelector("time[datetime]"));
    assert.equal(document.querySelector("button, input, select, h1, h2"), null);
    const root = document.getElementById("app-react-source-root");
    const fiberKey = Object.getOwnPropertyNames(root).find((key) =>
      key.startsWith("__reactContainer$")
    );
    const fiber = root[fiberKey];
    window.console.log("真实 Fiber", fiber);
    const captured = store.entries.at(-1).values[1];
    assert.equal(captured.label, "Fiber");
    assert.equal(property(captured, "stateNode").label, "FiberRoot");
    await delay(70);
    assert.match(container.textContent, /Fiber/);
    await app.act(() => {
      app.unmount();
      mounted = false;
    });
    assert.equal(
      document.getElementById("app-react-source-root").textContent,
      ""
    );
  } finally {
    if (mounted) await app.act(() => app.unmount());
    stopView();
    stopCapture();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});

test("微前端入口同步注册生命周期，加载中卸载不会迟到挂载，重挂载可继续采集", async () => {
  const { dom, window, container } = createWindow();
  container.id = "source-console";
  window.__MICRO_APP_ENVIRONMENT__ = true;
  const keys = [
    "window",
    "document",
    "Node",
    "Element",
    "console",
    "IS_REACT_ACT_ENVIRONMENT",
    ...Object.keys(loggerScopes),
  ];
  const previous = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
  );
  Object.assign(globalThis, {
    window,
    document: window.document,
    Node: window.Node,
    Element: window.Element,
    console: window.console,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  // 浏览器中的 window 属性同时是全局标识符；jsdom 需要显式映射。
  for (const name of Object.keys(loggerScopes)) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get: () => window[name],
    });
  }
  const original = window.console.log;
  const app = require(`${root}.cache/tests/page-demo.cjs`);
  try {
    require(`${root}.cache/tests/page-main.cjs`);
    assert.equal(typeof window.mount, "function");
    assert.equal(typeof window.unmount, "function");
    const pending = window.mount();
    window.unmount();
    await pending;
    assert.equal(
      document.getElementById("app-react-source-root").childElementCount,
      0
    );
    assert.equal(window.console.log, original);
    await app.act(() => window.mount());
    await delay(70);
    assert.match(container.textContent, /\[react-source\] createRoot/);
    assert.notEqual(window.console.log, original);
    await app.act(() => window.unmount());
    assert.equal(window.console.log, original);
    assert.equal(container.childElementCount, 0);
    await app.act(() => window.mount());
    assert.ok(document.querySelector(".runtime-info"));
  } finally {
    await app.act(() => window.unmount?.());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});
