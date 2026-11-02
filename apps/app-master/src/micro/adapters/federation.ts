import type { MicroEngine } from "../types";

export const engine: MicroEngine = {
  initialize() {},
  mount({ container, basePath, signal }) {
    let unmount: (() => void) | undefined;
    // 由 Webpack 联邦运行时请求 remoteEntry、初始化共享依赖并获取暴露模块。
    const ready = import("appFederation/mount").then(({ mount }) => {
      if (!signal.aborted) unmount = mount(container, { basePath });
    });
    return {
      ready,
      async dispose() {
        // 离开时无需等待远端网络；signal 保证迟到的模块不会挂载。
        unmount?.();
      },
    };
  },
};
