import { mount as render } from "./render";

// 显式构建路径优先；否则使用沙箱注入的资源目录或独立入口所在目录。
if (!__webpack_public_path__) {
  const script = document.currentScript as HTMLScriptElement | null;
  const publicPath =
    window.__MICRO_APP_PUBLIC_PATH__ ||
    (script?.src && new URL(".", script.src).href);
  if (publicPath) __webpack_public_path__ = publicPath;
}

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
