import { DOCUMENT } from "@angular/common";
import { enableProdMode } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import { provideRouter, withHashLocation } from "@angular/router";
import { StudioApp } from "./studio-app";
import { routes } from "./routes";
import "./styles.css";

if (process.env.NODE_ENV === "production") enableProdMode();

export function mount(container: HTMLElement) {
  // 显式传入宿主节点，兼容 Wujie 将视图移入主应用 Shadow DOM 的情况。
  const host = document.createElement("studio-app");
  container.appendChild(host);
  let disposed = false;
  let application: Awaited<ReturnType<typeof createApplication>> | undefined;
  const ready = createApplication({
    providers: [
      { provide: DOCUMENT, useValue: document },
      provideRouter(routes, withHashLocation()),
    ],
  }).then((app) => {
    // Angular 初始化是异步的；初始化期间离开页面也必须释放应用。
    if (disposed) {
      app.destroy();
      return;
    }
    application = app;
    try {
      app.bootstrap(StudioApp, host);
    } catch (error) {
      destroy();
      throw error;
    }
  });
  function destroy() {
    if (disposed) return;
    disposed = true;
    application?.destroy();
    host.remove();
  }
  return { ready, destroy };
}
