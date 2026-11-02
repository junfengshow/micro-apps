import "./styles/base.css";
import {
  qiankunWindow,
  renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";
import { mount, unmount } from "./micro/lifecycle";

renderWithQiankun({
  bootstrap() {},
  mount,
  unmount,
  update: mount,
});

if (window.__MICRO_APP_ENVIRONMENT__) {
  // micro-app 会在两个钩子就绪后挂载；使用其独立虚拟路由。
  window.mount = () => mount();
  window.unmount = unmount;
} else if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  mount();
}
