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

打开 http://localhost:7105/ 查看手动阶段日志。在源码中使用 Logger、MainLogger 等方法输出到页面，例如：

```js
window.MainLogger?.info("createRoot", root);
```

源码改动后需要重新编译 React。普通 `console.log` 不会进入页面，仍按浏览器原生行为输出到控制台。

## 页面日志与对象快照

- 页面顶部仅展示 React 运行时版本与编译时间，其余空间用于日志；没有示例面板、解释文字或筛选工具栏。
- 页面仅显示 `loggerScopes` 中阶段日志方法的手动输出，不拦截原生 console，也不自动采集异常或 Promise 拒绝。阶段日志不转发到控制台。停留在底部时跟随新日志，上翻阅读时保持位置。
- 配色遵循参考 demo：标题黄色、属性名青色、属性值绿色、对象展开入口紫色；step 标题绿色、tag 粉色、line 橙色、警告红字黄底。
- 每次打印时同步生成独立快照，展开属性时不再读取原始对象。随后修改嵌套对象、数组、Map、Set，也不会改变旧日志。
- 支持循环引用、BigInt、函数、Error 等值。普通对象的 getter 不会执行。为避免 Fiber 等大型对象阻塞页面，快照限制深度、节点数、属性数和文本量，达到限制时会显示提示。
- 对象展示具体类型：自定义类保留构造函数名，React 内部结构识别为 `Fiber`、`FiberRoot`、`Hook`。兼容 React 19 使用普通对象创建 Fiber 的实现；循环引用也带类型标记。
- 日志仅存放在当前页面内存中，最多保留最近 300 条，刷新页面后重新采集；不写入 localStorage 或其他持久化存储。
- 日志面板使用独立的原生 DOM 更新，不会因为显示日志再次触发 React 的 Hooks / Fiber 渲染。新增日志会保留已有对象的展开状态；卸载时恢复原有全局日志辅助方法。

## Logger 使用说明

这些方法在加载 React 之前注册到当前页面的 `window`，无需 import。调用后仅写入页面日志，不转发到浏览器 Console；普通 `console.log` 等方法不受影响。卸载子应用时会恢复原有全局方法。

### 选择 Logger

所有 Logger 都提供下面相同的八个方法，区别是日志前的阶段标签，选择哪个不会自动启用采集或触发 React 行为。

| Logger            | 页面标签      | 适合记录的内容                                    |
| ----------------- | ------------- | ------------------------------------------------- |
| `Logger`          | `[Main]`      | 通用日志、临时观察值，与 `MainLogger` 用途一致    |
| `MainLogger`      | `[Main]`      | 根节点创建、主流程入口、整体执行顺序              |
| `EventsLogger`    | `[Events]`    | 事件触发、事件处理、交互产生的更新                |
| `SchedulerLogger` | `[Scheduler]` | 任务优先级、任务入队、调度与让出执行权            |
| `RenderLogger`    | `[Render]`    | `beginWork`、`completeWork`、Fiber 协调与渲染过程 |
| `CommitLogger`    | `[Commit]`    | DOM 提交、布局副作用、提交阶段的执行与清理        |
| `HooksLogger`     | `[Hooks]`     | Hook 状态、更新队列、effect 的执行与清理          |

例如在 `beginWork` 中记录当前 Fiber：

```js
window.RenderLogger?.step("beginWork", workInProgress);
```

也可以像参考 demo 一样直接调用 `RenderLogger.step(...)`。推荐使用上面的 `window.RenderLogger?.` 写法：在浏览器页面中尚未注册该 Logger 时会跳过调用；如果源码还会在 Node 或其他非浏览器环境执行，需额外判断 `typeof window !== "undefined"`。

### 通用参数

八个方法的实际签名都是 `method(...args: unknown[]): void`：接受任意数量、任意类型的参数，没有必填参数，不返回数据。为便于阅读，推荐采用 `method("标题", 数据1, 数据2, ...)` 的形式。

| 参数位置         | 类型与是否必填               | 作用                                                                                                   |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| 第一个参数       | 任意类型，可选；建议传字符串 | 如果是字符串，作为当前条目的标题，按所用方法着色；如果是对象或其他值，则直接按普通数据展示，不生成标题 |
| 第二个及后续参数 | 任意类型，可选               | 按传入顺序展示数据；对象在调用当下生成独立快照，点击类型名称可展开属性                                 |

参数可以是字符串、数字、布尔值、`null`、`undefined`、BigInt、函数、对象、数组、Map、Set、Error 等。Fiber 等对象会带上类型标签。每次调用最多采集前 **16 个参数**，标题也计入；超出部分显示省略提示。对象的深度、节点数和文本量也有限制，达到限制时显示截断提示。

以下参数规则对所有方法都适用：

- 字符串按文本原样显示，不执行 HTML，也不解析 Console 的 `%s`、`%o`、`%c` 等格式占位符。
- 参数没有隐含的 `level`、`options` 或 `end` 配置含义。例如 `line("结束", true)` 中的 `true` 只是待展示的数据，不会改变分隔线的位置。
- 参数在调用时同步快照，页面随后批量刷新。之后修改原对象，包括展开日志之前修改，都不会改变已记录的内容。

### 各方法用途

下表中的 `logger` 可以替换为上面任意一个 Logger；`state`、`fiber`、`hook`、`error` 等是你希望观察的变量。

| 方法    | 推荐调用形式                             | 用途与页面效果                                                                                    |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `log`   | `logger.log("当前状态", state)`          | 通用数据输出；字符串标题为黄色，后续参数展示快照                                                  |
| `info`  | `logger.info("创建根节点", root)`        | 标记普通流程信息；当前显示效果与 `log` 相同                                                       |
| `debug` | `logger.debug("更新队列", queue, lanes)` | 记录较细的中间状态；当前显示效果与 `log` 相同，不会隐藏或过滤                                     |
| `warn`  | `logger.warn("优先级异常", lanes)`       | 提醒值得关注的状态；字符串标题为红字黄底，条目带黄色边线；不会抛出异常或中断执行                  |
| `error` | `logger.error("提交失败", error)`        | 展示错误或异常数据；字符串标题及条目边线为粉红色；不会替你抛出异常                                |
| `step`  | `logger.step("beginWork", fiber)`        | 标记一次执行步骤；字符串标题为绿色，后续参数可携带当前 Fiber、Hook 或其他状态；不会自动跟踪调用链 |
| `tag`   | `logger.tag("一次更新开始", state)`      | 标记重要节点或某一轮执行；字符串标题为粉色，内容两侧显示 `##`；不会创建日志分组                   |
| `line`  | `logger.line("commit 阶段")`             | 分隔不同阶段；条目前显示橙色虚线，字符串标题为橙色；可继续传入数据参数，不负责开始或结束分组      |

只有第一个参数为字符串时，才有上述标题颜色。对象展开入口统一为紫色，属性名为青色，属性值为绿色；属性名包含 `Str` 时，其说明值使用橙色。

### 调用示例

```js
const state = { count: 0, nested: { enabled: true } };

window.Logger?.log("普通状态", state);
window.MainLogger?.info("更新前", state);
window.SchedulerLogger?.debug("调度信息", { priority: 1, lanes: 2 });
window.EventsLogger?.tag("用户交互", { event: "click" });
window.RenderLogger?.step("开始渲染", state);
window.HooksLogger?.warn("检查 Hook 状态", state.nested);
window.CommitLogger?.line("提交阶段");
window.CommitLogger?.error("提交失败示例", new Error("示例错误"));

state.count = 1;
state.nested.enabled = false;
window.MainLogger?.info("更新后", state);
// 展开“更新前”，其中 count 仍为 0，nested.enabled 仍为 true。
```

在 React 源码中插入日志时，使用所在函数已有的变量，并建议限制在开发分支：

```js
if (__DEV__ && typeof window !== "undefined") {
  window.RenderLogger?.step("beginWork", workInProgress);
}
```

修改 `vendor/react/` 中的源码后，仍需执行下方的编译、重启步骤，新的日志调用才会进入运行时产物。

## 修改源码后的循环

1. 在 `vendor/react/packages/` 下修改源码、添加日志。
2. 停止开发服务（Ctrl+C）。
3. 在本应用目录执行以下命令。
4. 刷新页面；如果嵌入主应用，刷新主应用或重新进入此菜单。

```bash
npm run react:build
npm run dev
```

`react:build` 直接调用上游 `scripts/rollup/build.js`，设置 `RELEASE_CHANNEL=stable`，仅生成浏览器调试需要的 **NODE_DEV** 产物：React、DOM、JSX 和 Scheduler 的六个入口。`NODE_PROD` 在 `scripts/react.mjs` 中保留为注释，日常编译跳过生产包，减少编译时间。官方构建会先清理旧产物，因此原先的生产包也会被清除。脚本成功后记录编译时间，页面会显示最近一次编译时间。

### 开发环境构建范围

执行 `npm run react:build` 时，仅构建 **3 个包、6 个入口，生成 6 个开发产物**：

| 包          | 入口                    | 用途                                           | 产物文件（位于对应包的 `cjs/` 中）     |
| ----------- | ----------------------- | ---------------------------------------------- | -------------------------------------- |
| `react`     | `react`                 | Hooks、组件、Context 等核心 API                | `react.development.js`                 |
| `react`     | `react/jsx-runtime`     | JSX 自动运行时                                 | `react-jsx-runtime.development.js`     |
| `react`     | `react/jsx-dev-runtime` | 开发模式的 JSX 自动运行时                      | `react-jsx-dev-runtime.development.js` |
| `react-dom` | `react-dom`             | DOM 公共 API 与共享内部状态                    | `react-dom.development.js`             |
| `react-dom` | `react-dom/client`      | 创建根节点、渲染、更新与卸载                   | `react-dom-client.development.js`      |
| `scheduler` | `scheduler`             | React 更新任务调度，供 `react-dom/client` 使用 | `scheduler.development.js`             |

产物目录为 `vendor/react/build/node_modules/`，例如 `vendor/react/build/node_modules/react-dom/cjs/react-dom-client.development.js`。Vite 通过路径别名使用这些本地产物。

默认不生成 `*.production.js`，也不单独构建 React 服务端、React Native、React Compiler、DevTools、`jest-react` 或 `scheduler/index.native` 等目标。`react-reconciler`、`react-dom-bindings`、`shared` 的源码会按依赖编入上述产物，无需单独输出包，源码目录仍需保留。

### 按需构建生产产物

仅在需要正式打包 Vite 应用时，显式编译开发与生产两种 React 产物：

```bash
npm run react:build -- --production
npm run build
```

构建目标配置保留在 `vendor/react/scripts/rollup/bundles.js`。其余目标的完整配置已注释保留，需要时可以取消注释恢复；调用脚本位于 `scripts/react.mjs`，入口范围需要同时与该脚本保持一致。

### 重新加载与源码观察位置

`npm run dev` 和 Vite 的 `optimizeDeps.force` 都强制刷新预打包缓存，避免重启后继续使用旧产物。只改源码、只刷新页面、只重启 Vite，都不会替你执行 React 编译。

可在下列位置添加日志，通过应用挂载或自行编写测试组件触发：

| 想观察的行为               | 源码路径（相对 vendor/react）                      | 函数               |
| -------------------------- | -------------------------------------------------- | ------------------ |
| 创建根节点，刷新页面触发   | `packages/react-dom/src/client/ReactDOMRoot.js`    | `createRoot`       |
| 调用 useState              | `packages/react/src/ReactHooks.js`                 | `useState`         |
| 函数组件渲染               | `packages/react-reconciler/src/ReactFiberHooks.js` | `renderWithHooks`  |
| 组件调用 setState 发起更新 | `packages/react-reconciler/src/ReactFiberHooks.js` | `dispatchSetState` |

建议用 `if (__DEV__) { window.HooksLogger?.info(...) }` 记录少量值。渲染、调度等路径可能被频繁执行；日志数量不一定等于更新次数。页面没有包裹 StrictMode，方便初次观察。

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
npm run typecheck
```

`npm test` 在 Node + jsdom 中直接加载本地开发构建，检查 React 版本、源码日志执行、useState 点击更新、effect 清理、卸载、对象快照不受后续修改影响、真实 Fiber 的类型展示、精简页面及日志面板不会触发额外 React 渲染。生产日志检查仅在 NODE_PROD 产物存在时执行。测试不启动浏览器。

日常使用 `npm run dev` 观察日志。`npm run build` / `preview` 仍用于生产应用，需要先通过上述 `--production` 选项编译正式 React 包；`__DEV__` 分支会被移除。

此方案满足“修改源码、重新编译、观察日志”。React 官方 Rollup 构建未提供原始源码 sourcemap；Vite 的 sourcemap 对应已编译包，不能保证在开发者工具中直接对原始 Flow 源文件断点调试。

应用格式化会跳过 `vendor/react/`，避免改写上游源码。`node_modules/`、React 的 `build/`、Vite 的 `dist/` 和 `.cache/` 不提交，源码、上游锁文件和应用锁文件保留。
