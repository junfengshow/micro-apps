# micro-apps

微前端演示仓库，包含 qiankun、micro-app、Wujie、Webpack Module Federation 四种接入方案，以及基于本地 React 源码构建的调试应用。

各应用独立管理依赖，根目录不设置 `package.json`；统一命令由 `scripts/workspace.mjs` 提供。

## 环境要求

- Node.js：`^22.22.3 || ^24.15.0 || >=26.0.0`，满足全部应用的运行要求。
- npm：10 或以上。
- Java：11 或以上，仅编译 React 源码时需要；macOS 脚本会自动选择本机兼容 JDK。

## 应用列表

| 应用                                                  | 端口 | 说明                                                 |
| ----------------------------------------------------- | ---- | ---------------------------------------------------- |
| [app-master](apps/app-master/README.md)               | 3000 | React 主应用，提供菜单和子应用生命周期管理           |
| [app-vite-react](apps/app-vite-react/README.md)       | 7100 | Vite + React，通过 micro-app 接入                    |
| [app-qiankun-vue](apps/app-qiankun-vue/README.md)     | 7101 | Vue 3，通过 qiankun 接入                             |
| [app-micro-app](apps/app-micro-app/README.md)         | 7102 | micro-app 子应用                                     |
| [app-wujie-angular](apps/app-wujie-angular/README.md) | 7103 | Angular，通过 Wujie 接入                             |
| [app-federation](apps/app-federation/README.md)       | 7104 | Webpack Module Federation 子应用                     |
| [app-react-source](apps/app-react-source/README.md)   | 7105 | Vite + 本地编译的 React 19.3.0，支持修改源码观察日志 |

## 快速启动

在仓库根目录执行：

```bash
# 安装各应用依赖
node scripts/workspace.mjs install

# 首次运行 React 源码应用前，安装上游依赖并编译
npm --prefix apps/app-react-source run react:setup

# 启动全部应用
node scripts/workspace.mjs dev
```

访问 [主应用](http://localhost:3000/)，通过菜单切换子应用；也可通过上表端口独立访问。启动命令不会自动打开浏览器，按 Ctrl+C 停止服务。

只启动指定应用时，在命令后追加应用名，例如：

```bash
node scripts/workspace.mjs dev app-master app-react-source
```

也可进入应用目录执行 `npm run dev`，或使用 `scripts/start-app-*.sh`。`scripts/start-all.sh` 用于启动全部应用。

## React 源码调试

源码位于 `apps/app-react-source/vendor/react/`。修改后停止开发服务，在仓库根目录重新编译并启动：

```bash
npm --prefix apps/app-react-source run react:build
node scripts/workspace.mjs dev app-master app-react-source
```

刷新页面即可观察源码日志。构建入口、示例位置和调试说明见 [React 源码实验室](apps/app-react-source/README.md)。

## 检查与构建

```bash
node scripts/workspace.mjs typecheck
node scripts/workspace.mjs build
node scripts/workspace.mjs format:check
node scripts/workspace.mjs format
```

以上命令也支持追加应用名，只处理指定应用。构建产物位于各应用的 `dist/` 目录，详细配置见对应应用文档。

主应用生命周期测试：

```bash
npm --prefix apps/app-master test
```

启动全部服务后，可检查 HTTP 入口与资源：

```bash
node scripts/check-http.mjs
```
