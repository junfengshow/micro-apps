import { startApp, destroyApp } from "wujie";
import { appFetch } from "../fetch";
import type { MicroEngine } from "../types";

export const engine: MicroEngine = {
  initialize() {},
  mount({ app, container, basePath, signal }) {
    const ready = startApp({
      // 实例名、HTML 入口与挂载容器由应用注册表及当前页面提供。
      name: app.name,
      url: app.entry,
      el: container,
      // 切走后不保活；子路由同步到主应用查询参数，支持刷新和分享恢复。
      alive: false,
      sync: true,
      props: { basePath },
      // 资源加载复用统一超时，并在离开页面时取消请求。
      fetch: appFetch(signal),
    });
    return {
      ready,
      async dispose() {
        await ready.catch(() => undefined);
        await destroyApp(app.name);
      },
    };
  },
};
