import type { MicroAppDefinition } from "./types";

// 注册顺序决定侧边栏顺序；name 同时用于路由和引擎实例标识，必须全局唯一。
// 入口由主应用构建配置注入，与子应用自身的资源路径分开配置。
const registry: Omit<MicroAppDefinition, "entry">[] = [
  // qiankun 读取 HTML 并从 UMD 导出中调用生命周期。
  {
    name: "app-qiankun-vue",
    title: "Vue 工作室",
    engine: "qiankun",
  },
  // iframe 提供执行沙箱；pure 路由模式不把子应用路由同步到主应用 URL。
  {
    name: "app-micro-app",
    title: "交互状态演示",
    engine: "micro-app",
    iframe: true,
    routerMode: "pure",
  },
  // wujie 的沙箱、保活和路由同步策略由 adapters/wujie.ts 配置。
  {
    name: "app-wujie-angular",
    title: "Angular 工作室",
    engine: "wujie",
  },
  // 此入口与 Webpack remotes 共用 FEDERATION_ENTRY 配置。
  {
    name: "app-federation",
    title: "共享依赖演示",
    engine: "federation",
  },
  // Vite 原生 ES 模块使用 iframe 沙箱；未指定 routerMode，沿用 micro-app 默认模式。
  {
    name: "app-vite-react",
    title: "React 工作室",
    engine: "micro-app",
    iframe: true,
  },
  // 与宿主 React 隔离，便于观察本地源码编译产物的行为。
  {
    name: "app-react-source",
    title: "React 源码实验室",
    engine: "micro-app",
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
// 已配置入口的子应用统一加入菜单，挂载时按应用选择适配器。
export const microApps: MicroAppDefinition[] = registry
  .map((app) => ({ ...app, entry: __MICRO_ENTRIES__[app.name] }))
  .filter((app) => app.entry);
