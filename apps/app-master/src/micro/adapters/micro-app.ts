import microApp from "@micro-zoe/micro-app";
import type { MicroEngine } from "../types";
import { appFetch } from "../fetch";

let initialized = false;

export const engine: MicroEngine = {
  initialize() {
    if (!initialized) {
      microApp.start({
        // micro-app 的自定义 fetch 返回资源文本，而 qiankun/wujie 使用 Response。
        fetch: async (url, options) => {
          const response = await appFetch()(url, options);
          if (!response.ok)
            throw new Error(`资源加载失败：${response.status} ${url}`);
          return response.text();
        },
      });
      initialized = true;
    }
  },
  mount({ app, container, basePath }) {
    const element = document.createElement("micro-app");
    element.setAttribute("name", app.name);
    element.setAttribute("url", app.entry);
    // 沙箱和虚拟路由模式按注册表逐应用选择；未填写时沿用引擎默认值。
    if (app.iframe) element.setAttribute("iframe", "true");
    if (app.routerMode) element.setAttribute("router-mode", app.routerMode);
    // 子应用拥有独立虚拟路由；卸载时销毁实例，不隐式保活。
    element.setAttribute("destroy", "true");
    let removeListeners = () => {};
    const ready = new Promise<void>((resolve, reject) => {
      const mounted = () => {
        removeListeners();
        resolve();
      };
      const error = () => {
        removeListeners();
        reject(new Error(`无法加载 ${app.title}，请检查入口地址和跨域配置。`));
      };
      removeListeners = () => {
        element.removeEventListener("mounted", mounted);
        element.removeEventListener("error", error);
      };
      element.addEventListener("mounted", mounted);
      element.addEventListener("error", error);
    });
    microApp.setData(app.name, { basePath });
    container.appendChild(element);
    return {
      ready,
      async dispose() {
        removeListeners();
        await microApp.unmountApp(app.name, { destroy: true, clearData: true });
        element.remove();
      },
    };
  },
};
