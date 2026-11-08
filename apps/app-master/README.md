# app-master

原生 Webpack + React + React Router + Ant Design + Tailwind CSS 主应用，在同一运行时按应用选择 qiankun、micro-app、wujie 或 Module Federation。根目录不需要包配置；本应用保留独立锁文件与依赖目录。

## 启动

建议在仓库根目录执行 `node scripts/workspace.mjs install`，然后执行 `node scripts/workspace.mjs dev`，一次启动主应用和全部子应用。

只启动主应用时，在本目录执行：

```bash
npm install
npm run dev
```

访问 http://localhost:3000，从同一个菜单打开任一子应用。六个子应用默认监听 7100–7105。子应用未启动时，对应页面显示错误并可重试。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动主应用 |
| `npm run build` | 类型检查并构建到 `dist` |
| `npm run typecheck` | 检查源文件 |
| `npm test` | 验证取消加载、串行卸载、失败后切换等生命周期行为 |

主应用在打开子应用时按需加载对应的适配器。

## 目录与职责

- `config/webpack.*.cjs`：公共、开发、生产配置；模块联邦宿主配置位于公共配置。
- `src/main.tsx`：异步入口；`src/bootstrap.tsx`：React 渲染、主题、路由。
- `src/layouts/`、`src/pages/`、`src/router/`：公共布局与按需加载的页面。
- `src/micro/apps.ts`：应用名称、标题、引擎、入口、沙箱配置。
- `src/micro/engines.ts`：运行时适配器加载表。
- `src/micro/adapters/`：四种引擎的初始化、挂载和卸载。
- `src/micro/lifecycle.ts`：单展示区的生命周期调度；新实例等待旧实例完成卸载。
- `src/micro/MicroAppView.tsx`：加载提示、错误、重试和组件清理。
- `tests/lifecycle.test.ts`：不依赖浏览器的生命周期回归测试。

主应用管理 `/apps/:name/*` 路由。Qiankun Vue 子应用使用 Vue Router；Wujie Angular 22 子应用使用 Angular Router hash 路由，包含工作室页面与 Angular 知识手册；其余 Webpack 示例面板使用本地状态。退出菜单时取消加载请求、卸载子应用并清理容器；不启用保活。旧 Vite 应用继续使用 micro-app 的虚拟路由。

## 四种接入

1. **qiankun**：子应用构建为 UMD，导出 `bootstrap/mount/unmount`；主应用调用 `loadMicroApp`，传入独立容器与 `basePath`，使用 JS 沙箱与样式前缀隔离。
2. **micro-app**：子应用通过 `window.mount/unmount` 暴露生命周期；主应用创建自定义元素。新示例使用 iframe 沙箱和 `pure` 路由模式，已有 Vite 应用保留默认路由模式。自定义资源 fetch 返回文本。
3. **wujie**：子应用定义 `__WUJIE_MOUNT/UNMOUNT`，主应用通过 `startApp` 挂载，通过 `destroyApp` 销毁。启用路由同步，子路由写入主应用的 `app-wujie-angular` 查询参数，刷新或分享链接可恢复对应页面；关闭保活，资源 fetch 返回 Response。
4. **模块联邦**：远端 `appFederation` 的 `remoteEntry.js` 暴露 `./mount`；宿主调用 `import('appFederation/mount')`。导出的 `mount(container, props)` 返回清理函数。主、子应用均设置异步入口，并共享 React 和 React DOM/client 单例，防止共享依赖同步消费错误。

联邦模块在首次加载后由 Webpack 缓存，切换菜单只销毁 React 实例，不删除已加载的模块。子应用使用 CSS Modules，模块联邦本身不提供 JS/CSS 沙箱。Tailwind 未启用全局 Preflight。

资源请求和 Webpack chunk 加载设置了超时，避免服务不可达时无限加载。适配器的取消标记阻止迟到的远端模块在离开后重新挂载。极端的第三方脚本执行异常仍可能影响宿主；实际浏览器中的引擎兼容性需集成验证。

## 部署

主应用和各子应用分别构建到各自的 `dist`。各子应用独立部署，资源服务需允许主应用跨域读取资源。

开发模式从 `.env.development` 读取各子应用的本地入口，生产构建从 `.env.production` 读取线上入口。构建时传入的环境变量优先于文件中的同名值，所有配置了入口的子应用都会加入同一个菜单。

| 环境变量 | 子应用入口 |
| --- | --- |
| `VITE_REACT_ENTRY` | app-vite-react 的 HTML 入口 |
| `QIANKUN_VUE_ENTRY` | app-qiankun-vue 的 HTML 入口 |
| `MICRO_APP_ENTRY` | app-micro-app 的 HTML 入口 |
| `WUJIE_ANGULAR_ENTRY` | app-wujie-angular 的入口，在环境文件中用引号保留 `#/` |
| `FEDERATION_ENTRY` | app-federation 的完整 `remoteEntry.js` 地址 |
| `REACT_SOURCE_ENTRY` | app-react-source 的 HTML 入口 |

主应用默认部署在站点根路径。部署到子路径时，在构建前设置 `APP_MASTER_BASE_PATH`，例如 `/workbench/`。服务器需将该路径下的页面请求回退到 `index.html`，缺失的 JS、CSS 应返回 404。

在 Vercel 中将 Root Directory 设为 `apps/app-master`，Output Directory 设为 `dist`。`vercel.json` 会将 `/apps/` 下的子应用路由重写到 `index.html`，刷新或直接访问时由 React Router 接管。

每个新应用覆盖开发服务器的 `sockjs > uuid` 到兼容 CommonJS 的 11.x。依赖锁文件独立管理，CI 可在各目录运行 `npm ci`。
