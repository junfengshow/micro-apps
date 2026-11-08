# app-wujie-angular

现代 **Angular 22.2.4** + Angular Router + TypeScript 6 + Webpack 子应用，通过 Wujie 接入主应用。采用独立组件、Signals / computed、内置 `@if` / `@for` 控制流、OnPush 和类型化响应式表单，默认无 Zone.js。Angular 依赖精确锁定，移除了 AngularJS 与 angular-route。

五个工作室页面和知识手册保留 Angular 红色主题（主色 `#dd0031`）。知识手册全部面向现代 Angular，包括基础、核心、工程实践和 12 道面试题；交互演示通过真实 signal 更新及 computed 展示派生值。

## 开发与验证

Node.js 支持范围为 `^22.22.3 || ^24.15.0 || >=26.0.0`，TypeScript 为 `~6.0.2`。

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm test
npm run format:check
```

也可以在仓库根目录执行 `./scripts/start-app-wujie-angular.sh`，或 `node scripts/workspace.mjs dev app-wujie-angular`。替换依赖与构建配置后，需要重启此前的开发服务。

- 独立入口：[首页](http://localhost:7103/#/)、[Angular 知识手册](http://localhost:7103/#/angular)。
- 主应用入口：`/apps/app-wujie-angular`，开发端口为 7103。
- Angular Router 使用 `withHashLocation()`：`/`、`/products`、`/solutions`、`/about`、`/contact`、`/angular`。未知路径重定向首页；独立运行和 Wujie 共用路由。
- 手册支持关键词搜索、主题/难度筛选、答案展开、代码复制、空结果重置和 `/` 搜索快捷键。筛选通过 Router 保存到 hash 路由查询参数，支持分享与前进后退恢复。
- 联系页使用 `ReactiveFormsModule`、类型化 `FormGroup` 和校验器；拒绝空白姓名/消息及无效邮箱。演示表单不发送、不持久化数据。
- `npm run typecheck` 使用 Angular 编译器 `ngc --noEmit`，同时检查 TypeScript、依赖注入和严格模板类型。
- `npm run build` 通过 `@ngtools/webpack` 执行 AOT，Angular linker 处理依赖库的 partial declarations，运行时无需 JIT 编译器。为保持现有 Wujie HTML/经典脚本入口，沿用仓库的 Webpack 构建；Angular 官方已弃用其 Webpack 构建支持，后续可单独评估迁移构建工具。
- `npm test` 在 Node + jsdom 中执行生产包，覆盖页面、真实 Angular 交互、跨文档 Shadow DOM 导航、表单、筛选、复制与生命周期。不启动浏览器，不替代真实 Wujie 沙箱和视觉验证。

## 目录与生命周期

- `src/main.ts`：独立启动及 `__WUJIE_MOUNT` / `__WUJIE_UNMOUNT` 注册。
- `src/render.ts`：通过 `createApplication` 创建 Angular 应用，显式将根组件挂到宿主 DOM，卸载时调用 `ApplicationRef.destroy()`。
- `src/studio-app.ts`、`src/shell.html`：独立根组件、导航和 RouterOutlet。
- `src/routes.ts`、`src/pages/`：Angular Router 路由、五个页面组件和响应式联系表单。
- `src/handbook/`：类型化题库、基于 Signals 的手册组件与模板。
- `src/styles.css`：限定在 `#app-wujie-angular-root` 内的响应式红色主题。
- `tests/app.test.cjs`：生产包的 DOM 集成测试。

每次挂载创建独立应用实例，重复挂载先销毁旧实例；在异步初始化完成前卸载，会立即移除宿主，并在初始化完成时销毁迟到的实例。组件通过 `DestroyRef` 和 `takeUntilDestroyed` 释放事件、订阅，避免重复挂载积累监听器。

Wujie 使用 `alive: false`、`sync: true`，内部 hash 同步到主应用的 `app-wujie-angular` 查询参数，刷新或分享链接可恢复页面及筛选。例如产品页对应 `/apps/app-wujie-angular?app-wujie-angular=%2F%23%2Fproducts`。

执行 `npm run build` 后，将 `dist` 部署到允许主应用跨域读取资源的静态服务。Webpack 根据入口脚本推导分包路径，也可在构建时传入 `--env publicPath=...`。在主应用构建前设置 `WUJIE_ANGULAR_ENTRY` 注册子应用入口。

参考：[Angular 官方文档](https://angular.dev/)、[版本兼容性](https://angular.dev/reference/versions)、[无 Zone 变更检测](https://angular.dev/guide/zoneless)。
