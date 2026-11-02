# React 源码实验室

Vite + React + TypeScript 子应用，端口 **7105**。运行时 React **19.3.0** 完全来自本应用内的源码编译产物。

## 可行性与接入方式

这个方案可行：`源码 → 官方 Rollup 构建 → CommonJS 包 → Vite 预打包 → 页面`。React 源码含有 Flow 类型、内部别名和特性开关，不能直接把 `packages/react/src` 当成普通 Vite 依赖使用。

`vendor/react/` 是 [React v19.3.0](https://github.com/react/react/tree/v19.3.0) 的完整源码副本（来源与 commit 见 [vendor/README.md](vendor/README.md)），保留上游 `yarn.lock`。源码和应用依赖分别安装：上游使用 **Yarn 1.22.22**，应用使用 npm。

Vite 精确别名将 `react`、`react-dom`、`react-dom/client`、`react/jsx-runtime`、`react/jsx-dev-runtime`、`scheduler` 全部指向 `vendor/react/build/node_modules/`。应用未声明 npm 发布的 React 运行时依赖；`@types/react*` 只提供 TypeScript 类型。无需 npm link，也无需每次编译后重新 npm install。

## 首次安装与启动

要求 Node.js >= 20.19，以及 **Java 11+**（官方 Closure Compiler 需要），推荐使用本仓库现有 Node 24、Java 17 环境。编译脚本依次检查 JAVA_HOME、PATH 和 macOS 已安装的 JDK，仅在编译子进程中选择兼容 Java，不修改系统配置。首次安装上游工作区依赖较多，需要网络和额外磁盘空间。安装脚本跳过无关 DevTools 工作区的 Electron 二进制下载。

```bash
cd apps/app-react-source
npm install
npm run react:setup
npm run dev
```

打开 http://localhost:7105/，在开发者工具 Console 中可以看到：

```text
[react-source] createRoot · React v19.3.0
```

这条日志预置在 **React 源码** `vendor/react/packages/react-dom/src/client/ReactDOMRoot.js` 的 `createRoot` 中，不是业务入口打印的。源码改动仅此一处，使用 `if (__DEV__)` 包裹。

## 修改源码后的循环

1. 在 `vendor/react/packages/` 下修改源码、添加日志。
2. 停止开发服务（Ctrl+C）。
3. 在本应用目录执行以下命令。
4. 刷新页面；如果嵌入主应用，刷新主应用或重新进入此菜单。

```bash
npm run react:build
npm run dev
```

`react:build` 直接调用上游 `scripts/rollup/build.js`，设置 `RELEASE_CHANNEL=stable`，构建浏览器示例需要的 React、DOM、JSX 和 Scheduler 入口，同时生成 `NODE_DEV`、`NODE_PROD`。避免构建 React Native、服务端和 React Compiler 等无关目标。脚本成功后记录编译时间，页面会显示最近一次编译时间。

构建目标配置保留在 `vendor/react/scripts/rollup/bundles.js`。目前仅启用 `react`、`react/jsx-runtime`、`react/jsx-dev-runtime`、`react-dom`、`react-dom/client`、`scheduler` 六个入口，其余目标的完整配置已注释保留，需要时可以取消注释恢复。这样可避免官方 CLI 的子串匹配额外构建 `jest-react` 和 `scheduler/index.native`。`react-reconciler`、`react-dom-bindings`、`shared` 等源码仍会按依赖编入产物，无需作为独立目标构建。

`npm run dev` 和 Vite 的 `optimizeDeps.force` 都强制刷新预打包缓存，避免重启后继续使用旧产物。只改源码、只刷新页面、只重启 Vite，都不会替你执行 React 编译。

可先在下列位置添加日志，再用页面按钮触发：

| 想观察的行为             | 源码路径（相对 vendor/react）                      | 函数               |
| ------------------------ | -------------------------------------------------- | ------------------ |
| 创建根节点，刷新页面触发 | `packages/react-dom/src/client/ReactDOMRoot.js`    | `createRoot`       |
| 调用 useState            | `packages/react/src/ReactHooks.js`                 | `useState`         |
| 函数组件渲染             | `packages/react-reconciler/src/ReactFiberHooks.js` | `renderWithHooks`  |
| 点击按钮发起状态更新     | `packages/react-reconciler/src/ReactFiberHooks.js` | `dispatchSetState` |

建议用 `if (__DEV__) { console.log(...) }` 记录少量值。渲染、调度等路径可能被频繁执行；日志数量不一定等于点击次数。页面没有包裹 StrictMode，方便初次观察。

## 主应用接入

已在主应用菜单注册“React 源码实验室”，通过 micro-app iframe 沙箱运行，使用独立 React 实例。

```bash
# 仓库根目录；首次启动前先完成上面的 react:setup。
node scripts/workspace.mjs dev app-master app-react-source
# 或仅启动此子应用
./scripts/start-app-react-source.sh
```

主应用地址 http://localhost:3000/apps/app-react-source。现有主应用已运行时，注册表修改需等待热更新或重启服务。

## 验证与边界

```bash
npm test
npm run build
npm run preview
```

`npm test` 在 Node + jsdom 中直接加载本地构建，检查 React 版本、源码日志执行、useState 点击更新、effect 清理、卸载，以及生产产物移除示例开发日志。它不启动浏览器。`npm run build` 检查类型并构建 Vite 应用；不会自动重新编译 React。

`npm run dev` 使用开发构建，适合观察日志。`npm run build` / `preview` 使用生产构建，`__DEV__` 分支会被移除。

此方案满足“修改源码、重新编译、观察日志”。React 官方 Rollup 构建未提供原始源码 sourcemap；Vite 的 sourcemap 对应已编译包，不能保证在开发者工具中直接对原始 Flow 源文件断点调试。

应用格式化会跳过 `vendor/react/`，避免改写上游源码。`node_modules/`、React 的 `build/`、Vite 的 `dist/` 和 `.cache/` 不提交，源码、上游锁文件和应用锁文件保留。
