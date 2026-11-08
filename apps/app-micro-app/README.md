# app-micro-app

独立 React + TypeScript + Webpack 子应用，以 Micro-app 方式接入主应用，开发端口 7102。

```bash
npm install
npm run dev
npm run build
```

可独立访问 http://localhost:7102，也可从主应用侧边栏进入。应用包含两个内部面板、计数器和输入框，切换主应用菜单后卸载并重置状态。样式使用 CSS Modules。

入口适配位于 `src/main.tsx`，UI 位于 `src/App.tsx`，React 根节点的创建和销毁位于 `src/render.tsx`。

生产发布将 `dist` 部署到独立静态服务，并允许主应用跨域读取资源。资源目录由 micro-app 注入，独立运行时从入口脚本推导。需要指定资源目录时可在构建时传入 `--env publicPath=...`。在主应用构建前设置 `MICRO_APP_ENTRY` 注册子应用入口。
