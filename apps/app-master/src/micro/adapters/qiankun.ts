import { loadMicroApp } from "qiankun";
import type { MicroEngine } from "../types";
import { appFetch } from "../fetch";

export const engine: MicroEngine = {
  // 路由交给 React Router，按需加载模式不需要调用 qiankun.start。
  initialize() {},
  mount({ app, container, basePath, signal }) {
    const instance = loadMicroApp(
      // name 关联子应用实例，container 限定挂载区域，basePath 作为属性传给子应用。
      { name: app.name, entry: app.entry, container, props: { basePath } },
      // 实验性样式隔离通过选择器前缀限定样式；fetch 支持超时和离开时取消。
      { sandbox: { experimentalStyleIsolation: true }, fetch: appFetch(signal) }
    );
    return {
      ready: instance.mountPromise,
      async dispose() {
        // 等待正在进行的挂载结束，再执行卸载，避免生命周期竞态。
        await instance.mountPromise.catch(() => undefined);
        if (instance.getStatus() === "MOUNTED") await instance.unmount();
      },
    };
  },
};
