import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { createAppRouter } from "../router";
import type { MicroAppProps } from "./types";

let root: Root | undefined;
let router: ReturnType<typeof createAppRouter> | undefined;

export function unmount() {
  root?.unmount();
  router?.dispose();
  root = undefined;
  router = undefined;
}

export function mount(props: MicroAppProps = {}) {
  unmount();

  // qiankun 只在传入容器内查找，避免命中主应用或其他子应用的节点。
  const container = props.container
    ? props.container.querySelector<HTMLElement>("#app-vite-react-root")
    : document.getElementById("app-vite-react-root");

  if (!container) {
    throw new Error("找不到 app-vite-react 挂载节点 #app-vite-react-root");
  }

  const basePath = window.__MICRO_APP_ENVIRONMENT__
    ? "/"
    : props.basePath || "/";
  router = createAppRouter(basePath);
  root = createRoot(container);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
