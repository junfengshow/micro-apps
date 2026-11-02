# micro-apps

多个独立前端应用组成的微前端演示仓库。根目录不设置 `package.json`，各应用独立安装、构建和锁定依赖。

## 快速启动

全部应用一起运行要求 Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`、npm >= 10（Angular 22 的版本要求）。React 源码编译另需 Java 11+，macOS 编译脚本会自动选择本机兼容 JDK。在仓库根目录执行：

```bash
node scripts/workspace.mjs install
npm --prefix apps/app-react-source run react:setup
node scripts/workspace.mjs dev
```

也可以使用 `scripts` 下的快捷启动脚本（macOS / Linux / Git Bash）：

| 启动目标         | 在仓库根目录执行                       |
| ---------------- | -------------------------------------- |
| 全部应用         | `./scripts/start-all.sh`               |
| 主应用           | `./scripts/start-app-master.sh`        |
| Qiankun Vue      | `./scripts/start-app-qiankun-vue.sh`   |
| Micro-app        | `./scripts/start-app-micro-app.sh`     |
| Wujie Angular    | `./scripts/start-app-wujie-angular.sh` |
| 模块联邦         | `./scripts/start-app-federation.sh`    |
| Vite React       | `./scripts/start-app-vite-react.sh`    |
| React 源码实验室 | `./scripts/start-app-react-source.sh`  |

脚本会自动定位应用目录，也支持从其他目录通过绝对路径调用。首次运行前先执行上面的安装命令；单应用脚本只启动对应应用，如需在宿主中查看子应用，请另外启动主应用，或直接使用 `start-all.sh`。按 Ctrl+C 停止当前脚本启动的服务。

访问 http://localhost:3000，通过左侧菜单切换四种微前端方案。所有引擎在同一主应用运行时可用，每次只显示一个子应用；切走时卸载，返回后重建状态。既有的 Vite 应用保留为额外菜单。

| 应用              | 端口 | 接入方式                                               |
| ----------------- | ---- | ------------------------------------------------------ |
| app-master        | 3000 | React 主应用，统一侧边栏和生命周期调度                 |
| app-qiankun-vue   | 7101 | Vue 3 + qiankun 2，UMD 生命周期                        |
| app-micro-app     | 7102 | micro-app，自定义元素 + iframe 沙箱                    |
| app-wujie-angular | 7103 | Angular 22.2.4 + Wujie，红色工作室与知识手册           |
| app-federation    | 7104 | Webpack Module Federation，暴露挂载模块                |
| app-vite-react    | 7100 | 保留的 Vite 应用，通过 micro-app 接入                  |
| app-react-source  | 7105 | Vite + 本地 React 19.3.0 源码编译，通过 micro-app 接入 |

React 源码实验室首次启动前需执行 `react:setup` 安装上游依赖并编译。之后修改 `apps/app-react-source/vendor/react/packages/` 下的源码，在该应用目录执行 `npm run react:build`，再重启 `npm run dev` 并刷新页面即可观察源码日志。详见 [源码实验室说明](apps/app-react-source/README.md)。

启动脚本不会打开浏览器。按 Ctrl+C 会关闭本脚本创建的全部服务；任一服务启动失败时也会清理其他进程。运行前请确保上述端口没有被其他服务占用。

已有主应用和 Vite 服务时，可只启动新增子应用：

```bash
node scripts/workspace.mjs dev app-qiankun-vue app-micro-app app-wujie-angular app-federation
```

主应用的 Webpack 配置已更改，之前启动的主应用需重启以启用模块联邦配置。临时换端口可在 `apps/app-master` 执行 `npm run dev -- --port 3001`。

## 检查与构建

```bash
node scripts/workspace.mjs typecheck
node scripts/workspace.mjs build
```

Vue 子应用已从 `app-qiankun` 重命名为 `app-qiankun-vue`，端口仍为 7101；旧开发进程需重启。Vue 手册地址为 `/apps/app-qiankun-vue/vue`，详见 [Vue 子应用说明](apps/app-qiankun-vue/README.md)。

生命周期测试：`cd apps/app-master && npm test`。HTTP 检查：先启动全部服务，再在根目录执行 `node scripts/check-http.mjs`。该检查不启动或控制浏览器。

各应用也可以单独进入目录执行 `npm install`、`npm run dev`、`npm run build`。主应用的详细架构及部署说明见 [app-master/README.md](apps/app-master/README.md)。

## 代码格式化

根目录及全部七个应用目录均配置相同的 `.prettierrc`，各应用的格式化命令使用本地配置；React 源码实验室额外跳过上游源码。规则参考 `langchain-travel/apps/langchain-agent`：80 列、2 空格缩进、双引号、保留分号、ES5 尾逗号和 LF 换行。后续调整规则时需同步根目录及各应用的配置文件。

安装依赖后，在根目录批量格式化或检查各应用，也可在应用目录执行 `npm run format`、`npm run format:check`：

```bash
node scripts/workspace.mjs format
node scripts/workspace.mjs format:check
```

如需同时处理根目录文档和脚本，在根目录执行：

```bash
npm --prefix apps/app-master exec -- prettier --write .
npm --prefix apps/app-master exec -- prettier --check .
```

`.prettierignore` 排除依赖、构建产物、缓存和 npm 锁文件。

## 配置说明

构建配置、TypeScript 配置和运行时注册表已添加中文注释，可在对应文件中查看各选项的用途及配合关系。

| 配置位置                                                       | 职责与修改要点                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/app-master/webpack.config.cjs`                           | 读取 `--env engine` 筛选菜单，按 `--mode` 合并开发或生产配置                                |
| `apps/app-master/config/webpack.common.cjs`                    | 入口、输出路径、loader、路径别名和模块联邦宿主；`FEDERATION_ENTRY` 在构建时指定实际远端地址 |
| `apps/app-master/config/webpack.dev.cjs`                       | 主应用端口、History 路由回退、热更新和编译错误遮罩                                          |
| `apps/app-master/config/webpack.prod.cjs`                      | 生产 CSS 提取、共享分包、运行时分离和压缩                                                   |
| 四个 Webpack 子应用的 `webpack.config.cjs`                     | 各自端口、资源基础地址、样式隔离和跨域响应头；qiankun 配置 UMD，联邦应用暴露 `./mount`      |
| `apps/app-vite-react/vite.config.ts`                           | Vite 资源地址、固定端口、预览服务及 qiankun 开发桥接                                        |
| 各应用的 `tsconfig.json`                                       | 类型检查规则；TypeScript 支持在这些文件中使用 `//` 注释                                     |
| `apps/app-master/tsconfig.test.json`                           | 将生命周期测试单独编译为 Node 可执行的 CommonJS 文件                                        |
| `apps/app-master/postcss.config.cjs`、`src/styles/index.css`   | Tailwind 插件、样式层顺序与工具类扫描范围                                                   |
| `apps/app-master/src/micro/apps.ts`、`engines.ts`、`adapters/` | 菜单顺序、入口地址、引擎加载、沙箱、路由同步和卸载策略                                      |
| 三个带路由应用的 `src/router/`                                 | 页面路由、懒加载、回退及子应用的导航菜单                                                    |
| `scripts/workspace.mjs`、`scripts/check-http.mjs`              | 批量命令、应用列表、HTTP 检查端口与超时                                                     |
| `.gitignore`                                                   | 忽略依赖、构建产物、缓存和系统元数据                                                        |

`package.json` 和 `package-lock.json` 使用严格 JSON，不能直接添加注释；字段说明集中放在这里，锁文件由 npm 维护：

| 字段                               | 当前仓库中的含义                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `name`、`version`、`private`       | 各应用的包标识与版本；`private: true` 防止误发布到 npm                         |
| `type: "module"`                   | 仅 Vite 应用设置，让该包中的 `.js` 按 ES 模块解释；Webpack 配置显式使用 `.cjs` |
| `scripts.dev` / `dev:<engine>`     | 启动开发服务；主应用带引擎后缀的命令只筛选菜单                                 |
| `scripts.build` / `build:<engine>` | 先检查类型再生产构建；主应用输出到 `dist/<engine>`，子应用输出到各自 `dist`    |
| `scripts.typecheck`                | 使用当前应用的 TypeScript 配置执行类型检查，不生成 JS                          |
| `scripts.format` / `format:check`  | 使用应用本地的 Prettier 配置格式化或检查当前应用                               |
| `scripts.test`                     | 主应用运行生命周期测试；Vue 子应用构建后使用 jsdom 检查路由、交互和挂载卸载    |
| `scripts.preview`                  | 仅 Vite 应用提供，以预览服务加载本地生产构建产物                               |
| `dependencies` / `devDependencies` | 分别声明应用代码使用的依赖与构建、类型检查等开发工具                           |
| `engines.node`                     | 声明 Node.js 支持范围；Angular 22 要求 22.22.3+（22.x）或 24.15+（24.x）或 26+ |
| `overrides.sockjs.uuid`            | Webpack 应用将开发服务器间接使用的 uuid 约束为兼容 CommonJS 的 11.x            |

修改 HTML 子应用地址时，需同步更新主应用注册表和子应用 `publicPath`（Vite 为 `base`）；开发跨域响应头不替代生产静态服务的跨域配置。模块联邦的实际加载地址由主应用 Webpack `remotes` 决定，仅修改注册表中的 `entry` 不会改变远端请求地址。`MASTER_PORT` 只调整 HTTP 检查目标，不会修改主应用监听端口。
