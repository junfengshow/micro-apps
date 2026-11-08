if (
  window.__POWERED_BY_QIANKUN__ &&
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
} else if (!__webpack_public_path__) {
  // 独立运行时从入口脚本推导分包地址，深层路由不会改变资源目录。
  const script = document.currentScript as HTMLScriptElement | null;
  if (script?.src) __webpack_public_path__ = new URL(".", script.src).href;
}
export {};
