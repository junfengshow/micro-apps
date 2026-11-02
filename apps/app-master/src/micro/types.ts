export type EngineName = "qiankun" | "micro-app" | "wujie" | "federation";

export interface MicroAppDefinition {
  /** 全局唯一名称，同时用于 /apps/:name/* 路由。 */
  name: string;
  /** 侧边栏、页面标题和错误提示中的显示名称。 */
  title: string;
  /** HTML 入口；联邦应用填写描述性远端地址，实际地址由 Webpack remotes 决定。 */
  entry: string;
  /** 选择运行时适配器，也用于构建时的菜单筛选。 */
  engine: EngineName;
  /** 仅 micro-app 适配器使用；Vite 原生 ES 模块需要启用 iframe 沙箱。 */
  iframe?: boolean;
  /** 仅 micro-app 使用：search 将路由写入主应用查询参数，pure 不同步到主应用 URL。 */
  routerMode?: "search" | "pure";
}

export interface MountOptions {
  app: MicroAppDefinition;
  container: HTMLElement;
  basePath: string;
  signal: AbortSignal;
}

export interface MicroAppHandle {
  ready: Promise<unknown>;
  dispose(): Promise<unknown>;
}

export interface MicroEngine {
  initialize(): void;
  mount(options: MountOptions): MicroAppHandle;
}
