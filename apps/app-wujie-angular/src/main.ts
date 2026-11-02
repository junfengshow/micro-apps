import { mount } from "./render";

let instance: ReturnType<typeof mount> | undefined;
function unmount() {
  instance?.destroy();
  instance = undefined;
}
function render() {
  unmount();
  const container = document.getElementById("app-wujie-angular-root");
  if (!container) throw new Error("找不到 app-wujie-angular 挂载节点");
  instance = mount(container);
  return instance.ready;
}
if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = render;
  window.__WUJIE_UNMOUNT = unmount;
} else {
  void render().catch((error) => console.error("Angular 启动失败", error));
}
