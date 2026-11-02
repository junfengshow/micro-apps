import { mount as render } from "./render";
let dispose: (() => void) | undefined;
window.mount = () => {
  dispose?.();
  dispose = render(
    document.getElementById("child-root")!,
    window.microApp?.getData()
  );
};
window.unmount = () => {
  dispose?.();
  dispose = undefined;
};
if (!window.__MICRO_APP_ENVIRONMENT__) window.mount();
