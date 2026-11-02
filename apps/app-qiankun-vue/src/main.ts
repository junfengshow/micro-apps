import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";
import { createAppRouter } from "./router";
import "./styles.css";

let dispose: (() => void) | undefined;
export async function bootstrap() {}
export async function mount(
  props: { container?: HTMLElement; basePath?: string } = {}
) {
  dispose?.();
  dispose = undefined;
  const container = (props.container ?? document).querySelector<HTMLElement>(
    "#app-qiankun-vue-root"
  );
  if (!container) throw new Error("找不到 app-qiankun-vue 挂载节点");
  const router = createAppRouter(props.basePath);
  const app = createApp(App);
  app.use(router);
  dispose = () => {
    app.unmount();
    router.options.history.destroy();
  };
  try {
    await router.isReady();
    app.mount(container);
  } catch (error) {
    dispose();
    dispose = undefined;
    throw error;
  }
}
export async function unmount() {
  dispose?.();
  dispose = undefined;
}
if (!window.__POWERED_BY_QIANKUN__) {
  document.body.style.margin = "0";
  void mount();
}
