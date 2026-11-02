import { createRoot } from "react-dom/client";
import { App } from "./App";

// 返回实例自己的销毁函数，宿主卸载时释放整个 React 树。
export function mount(
  container: HTMLElement,
  props: { basePath?: string } = {}
) {
  const root = createRoot(container);
  root.render(<App basePath={props.basePath} />);
  return () => root.unmount();
}
