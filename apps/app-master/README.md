# app-master

原生 Webpack + React + React Router + Ant Design + Tailwind CSS 主应用，在同一运行时按应用选择 qiankun、micro-app、wujie 或 Module Federation。根目录不需要包配置；本应用保留独立锁文件与依赖目录。

## 启动

建议在仓库根目录执行 `node scripts/workspace.mjs install`，然后执行 `node scripts/workspace.mjs dev`，一次启动主应用和全部子应用。

只启动主应用时，在本目录执行：

```bash
npm install
npm run dev
```

访问 http://localhost:3000。四个新子应用分别监听 7101–7104；已有 Vite 应用保留在 7100。子应用未启动时对应页面显示错误并可重试。

| 命令                                        | 用途                                             |
| ------------------------------------------- | ------------------------------------------------ |
| `npm run dev`                               | 默认全部引擎菜单，可在运行时切换                 |
| `npm run dev:qiankun`                       | 仅展示 qiankun 菜单                              |
| `npm run dev:micro-app`                     | 仅展示 micro-app 菜单                            |
| `npm run dev:wujie`                         | 仅展示 wujie 菜单                                |
| `npm run dev:federation`                    | 仅展示模块联邦菜单                               |
| `npm run build`                             | 类型检查并构建完整主应用到 `dist/all`            |
| `npm run build:qiankun` / `build:micro-app` | 构建对应菜单筛选模式                             |
| `npm run typecheck`                         | 检查源文件                                       |
| `npm test`                                  | 验证取消加载、串行卸载、失败后切换等生命周期行为 |

单引擎命令现在用于筛选应用菜单。运行时加载表包含全部适配器，但只有访问对应应用时才下载引擎；不再使用构建别名替换引擎。生产配置未关闭默认包体积提示。

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

完整主应用构建到 `dist/all`；四个新子应用分别构建到自己的 `dist`。各子应用应独立部署，资源服务允许主应用来源跨域读取资源。

- qiankun、micro-app、wujie：修改 `src/micro/apps.ts` 的 HTML 入口。子应用生产构建可执行 `npm run build -- --env publicPath=https://child.example.com/` 配置资源地址。
- 模块联邦：在主应用构建前设置 `FEDERATION_ENTRY=https://remote.example.com/remoteEntry.js`；远端默认 `publicPath: auto`，分包跟随入口所在地址。注册表中的 entry 用于描述应用，实际联邦远端地址由 Webpack 的 remotes 决定。
- 主应用使用 BrowserRouter，服务器将页面路径回退到 `index.html`；缺失的 JS、CSS 应返回 404。当前部署基路径为 `/`。

每个新应用覆盖开发服务器的 `sockjs > uuid` 到兼容 CommonJS 的 11.x。依赖锁文件独立管理，CI 可在各目录运行 `npm ci`。
