import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";
import { installLogCapture } from "./console/capture";
import { createLogStore } from "./console/store";
import { mountLogView } from "./console/view";
import "./style.css";

const logs = createLogStore();
let stopCapture: (() => void) | undefined;
let stopView: (() => void) | undefined;
let app: typeof import("./bootstrap") | undefined;
let loading: Promise<typeof import("./bootstrap")> | undefined;
let generation = 0;
let disposed = false;
function startLogging() {
  const container = document.getElementById("source-console");
  if (!container) throw new Error("找不到源码日志面板");
  stopCapture ??= installLogCapture(window, logs);
  stopView ??= mountLogView(container, logs);
}
function stopLogging() {
  stopView?.();
  stopCapture?.();
  stopView = undefined;
  stopCapture = undefined;
}
async function mount() {
  const request = ++generation;
  startLogging();
  try {
    // 先注册阶段日志方法，再加载 React，源码初始化时也可手动输出。
    const loaded = await (loading ??= import("./bootstrap"));
    if (disposed || request !== generation) return;
    app = loaded;
    app.mount();
  } catch (error) {
    if (!disposed && request === generation)
      console.error("React 源码实验室启动失败", error);
    throw error;
  }
}
function unmount() {
  // 加载期间被卸载时，阻止异步 import 完成后再次挂载。
  generation++;
  try {
    app?.unmount();
  } finally {
    stopLogging();
  }
}

startLogging();
renderWithQiankun({ bootstrap() {}, mount, unmount, update: mount });
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.mount = mount;
  window.unmount = unmount;
} else if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  // mount 内已通过原生 console 报告启动错误。
  void mount().catch(() => {});
}
import.meta.hot?.dispose(() => {
  disposed = true;
  unmount();
});
