# app-vite-react

基于 Vite、React 19 和 React Router 7 的微前端示例子应用，支持独立访问，也可通过主应用的 qiankun 或 micro-app 模式加载。

## 启动

要求 Node.js >= 20.19、npm >= 10。在本目录运行：

```bash
npm install
npm run dev
```

开发服务器使用 `http://localhost:7100`，与主应用的注册入口一致。启动后可以独立访问五个工作室页面和 React 知识手册；在主应用内访问 `/apps/app-vite-react` 也可浏览。

React 知识手册位于 `/react`，独立于工作室的 `AppLayout`，从顶部导航“预约体验”右侧的“React 手册”按钮可在新标签页打开。手册按需加载，包含基础与哲学、事件系统、Hooks、渲染与性能、实践模式、面试题与答案六个分类；支持搜索、分组及难度筛选、代码复制和交互演示。面试题按状态与协调、Effects 与并发、性能与架构、工程场景、React 19 与服务端五组组织，题设先展示，答案单独展开；面试参考代码为结合题设使用的关键片段。`?tab=hooks` 等查询参数可直接定位分类，搜索和分组也会保留在 URL 中。

```bash
npm run typecheck
npm run build
npm run preview
```

开发模式会为 qiankun 关闭 React Fast Refresh，以兼容 `vite-plugin-qiankun` 的开发接入。

## 目录

```text
app-vite-react/
├── index.html              # 独立入口与专用挂载节点
├── vite.config.ts          # Vite、React 和 qiankun 插件配置
├── tsconfig.json           # 源码与 Vite 配置的类型检查
├── package.json
├── package-lock.json
└── src/
    ├── main.tsx            # 独立运行与微前端启动分支
    ├── micro/
    │   ├── lifecycle.tsx   # React 根节点、路由的挂载与销毁
    │   └── types.ts        # 主应用传入的挂载参数
    ├── router/
    │   ├── index.tsx       # 路由定义与 router 工厂
    │   └── navigation.ts   # 五页导航配置
    ├── layouts/
    │   ├── AppLayout.tsx   # 公共页头、导航、内容区与页脚
    │   └── AppLayout.css
    ├── pages/              # 每页独立目录，组件与样式就近存放
    │   ├── home/           # HomePage.tsx / HomePage.css
    │   ├── products/       # ProductsPage.tsx / ProductsPage.css
    │   ├── solutions/      # SolutionsPage.tsx / SolutionsPage.css
    │   ├── about/          # AboutPage.tsx / AboutPage.css
    │   ├── contact/        # ContactPage.tsx / ContactPage.css
    │   └── react/          # 独立知识手册、分类内容、Hook 示例与面试答案
    ├── styles/base.css     # 主题变量、公共组件与页面样式
    └── types/env.d.ts      # micro-app 生命周期声明
```

## 页面

- `/`：工作室首页
- `/products`：产品介绍
- `/solutions`：解决方案
- `/about`：关于工作室
- `/contact`：联系表单演示
- `/react`：独立 React 知识手册（19 个稳定 Hook 与 `use` 补充 API、32 道进阶至专家面试题（含场景题、追问与评价要点））

联系表单仅展示本地提交反馈，不会发送数据。

未匹配的路由会跳回首页；导航会高亮当前页面。

## 微前端与部署

- **qiankun**：由 `vite-plugin-qiankun` 桥接 ES 模块及生命周期，路由使用主应用传入的 `basePath`，例如 `/apps/app-vite-react`；只在传入容器内查找挂载节点。
- **micro-app**：主应用注册时启用 `iframe: true`，通过 iframe 沙箱执行 Vite 的原生 ES 模块，使用自己的虚拟路由 `/`，并通过 `window.mount` / `window.unmount` 管理生命周期。
- **清理与样式**：卸载时销毁 React 根节点和 router。主题、公共样式和页面样式均限定在 `#app-vite-react-root` 内；独立运行时单独重置外层 body 的边距。

本地构建的资源地址默认为 `http://localhost:7100/`，可直接用 `npm run preview` 供主应用加载。部署时使用实际子应用资源的完整地址构建，同时修改主应用注册表的 `entry`：

```bash
npm run build -- --base=https://example.com/app-vite-react/
```

子应用服务需允许主应用跨域获取入口和静态资源。独立运行使用 History 路由，静态服务器需把页面路由请求回退到 `index.html`，以支持直接访问和刷新深层页面；缺失的静态资源应返回 404。
