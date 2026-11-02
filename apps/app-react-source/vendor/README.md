# React 源码来源

- 上游：https://github.com/react/react/tree/v19.3.0
- 标签：`v19.3.0`
- Commit：`1d34f91dfde6bba84d08b683aaba164c7194dacb`
- 下载：https://codeload.github.com/react/react/tar.gz/refs/tags/v19.3.0
- `react/` 是标签源码的完整副本，不是 npm 发布包，也不是 Git submodule。保留上游 LICENSE、锁文件、构建脚本及目录结构。
- 本地源码改动：`packages/react-dom/src/client/ReactDOMRoot.js` 的 `createRoot` 添加 `__DEV__` 示例日志 `[react-source] createRoot · React v19.3.0`，方便确认浏览器加载了本地构建。
- 本地构建配置：`scripts/rollup/bundles.js` 仅启用 React、React DOM 和 Scheduler 的六个浏览器所需入口，其余目标完整保留为行注释，未删除上游配置。

`node_modules/`、`build/` 为安装/编译生成，不提交；上游目录不参与应用的 Prettier 格式化。
