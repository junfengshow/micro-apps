import type { MicroAppDefinition } from "./types";

// 注册顺序决定侧边栏顺序；name 同时用于路由和引擎实例标识，必须全局唯一。
// HTML 入口在部署时替换为实际地址，并与各子应用的 publicPath/base 保持一致。
const registry: MicroAppDefinition[] = [
  // qiankun 读取 HTML 并从 UMD 导出中调用生命周期。
  {
    name: "app-qiankun-vue",
    title: "Qiankun Vue 应用",
    engine: "qiankun",
    entry: "http://localhost:7101/",
  },
  // iframe 提供执行沙箱；pure 路由模式不把子应用路由同步到主应用 URL。
  {
    name: "app-micro-app",
    title: "Micro-app 子应用",
    engine: "micro-app",
    entry: "http://localhost:7102/",
    iframe: true,
    routerMode: "pure",
  },
  // wujie 的沙箱、保活和路由同步策略由 adapters/wujie.ts 配置。
  {
    name: "app-wujie-angular",
    title: "Wujie Angular 应用",
    engine: "wujie",
    entry: "http://localhost:7103/",
  },
  // 此 entry 用于描述远端；实际加载地址由 Webpack remotes / FEDERATION_ENTRY 决定。
  {
    name: "app-federation",
    title: "模块联邦子应用",
    engine: "federation",
    entry: "http://localhost:7104/remoteEntry.js",
  },
  // Vite 原生 ES 模块使用 iframe 沙箱；未指定 routerMode，沿用 micro-app 默认模式。
  {
    name: "app-vite-react",
    title: "Vite React 应用",
    engine: "micro-app",
    entry: "http://localhost:7100/",
    iframe: true,
  },
  // 与宿主 React 隔离，便于观察本地源码编译产物的行为。
  {
    name: "app-react-source",
    title: "React 源码实验室",
    engine: "micro-app",
    entry: "http://localhost:7105/",
    iframe: true,
    routerMode: "pure",
  },
];
const names = new Set<string>();
for (const app of registry) {
  if (!/^[a-z][a-z0-9-]*$/.test(app.name) || names.has(app.name))
    throw new Error(`子应用名称不合法或重复：${app.name}`);
  names.add(app.name);
}
// 常量由 Webpack DefinePlugin 注入；只筛选菜单，不替换运行时引擎加载表。
export const microApps = registry.filter(
  (app) => __MICRO_ENGINE__ === "all" || app.engine === __MICRO_ENGINE__
);
