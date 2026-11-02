import type { EngineName, MicroEngine } from "./types";

// 每种引擎仅在第一次访问对应菜单时下载；同一主应用可依次运行全部引擎。
// 键名须与应用注册表的 engine 一致；添加新引擎时在这里补充动态导入。
const loaders = {
  qiankun: () => import("./adapters/qiankun"),
  "micro-app": () => import("./adapters/micro-app"),
  wujie: () => import("./adapters/wujie"),
  federation: () => import("./adapters/federation"),
};

export async function loadEngine(name: EngineName): Promise<MicroEngine> {
  return (await loaders[name]()).engine;
}
