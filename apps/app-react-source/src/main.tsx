import { createRoot, type Root } from "react-dom/client";
import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";
import { App } from "./App";
import "./style.css";

let root: Root | undefined;
function unmount() {
  root?.unmount();
  root = undefined;
}
function mount() {
  unmount();
  const container = document.getElementById("app-react-source-root");
  if (!container) throw new Error("找不到 React 源码实验室挂载节点");
  root = createRoot(container);
  root.render(<App />);
}

renderWithQiankun({ bootstrap() {}, mount, unmount, update: mount });
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.mount = mount;
  window.unmount = unmount;
} else if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  mount();
}
