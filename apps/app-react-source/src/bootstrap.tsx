import { createRoot, type Root } from "react-dom/client";
import { App } from "./App";

let root: Root | undefined;
export function unmount() {
  root?.unmount();
  root = undefined;
}
export function mount() {
  unmount();
  const container = document.getElementById("app-react-source-root");
  if (!container) throw new Error("找不到 React 源码实验室挂载节点");
  root = createRoot(container);
  root.render(<App />);
}
