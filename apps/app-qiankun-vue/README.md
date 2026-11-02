# app-qiankun-vue

Vue 3 + TypeScript + Vue Router + Webpack 的 qiankun 子应用，原目录为 `app-qiankun`。参考 `app-vite-react` 的工作室页面与知识手册，采用 Vue 绿色主题与独立首页布局。

## 运行

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm test
```

独立访问 `http://localhost:7101/`；宿主入口为 `http://localhost:3000/apps/app-qiankun-vue`。在仓库根目录也可执行：

```bash
node scripts/workspace.mjs dev app-master app-qiankun-vue
```

目录重命名后需要重启旧的开发服务。端口仍为 7101，不会自动打开浏览器。

## 页面与功能

- `/`：Vue Studio 首页，绿色创意花园与产品、方案、手册入口。
- `/products`、`/solutions`、`/about`、`/contact`：产品概念、工作方式、工作室介绍和本地演示联系表单。
- `/vue`：独立 Vue 手册，6 个章节、38 个条目，其中 18 道面试题。提供章节搜索、主题与难度筛选、代码复制、答案展开、官方文档链接，以及响应式、计算属性、nextTick 和事件传播演示。
- `/vue?chapter=interview`：直达面试题。章节保存在 URL 查询参数中；未知页面回到当前应用首页。

示例覆盖 Vue 3，`defineModel` 标注 Vue 3.4+，响应式 props 解构、数字 deep、defer 和 `onWatcherCleanup` 标注 Vue 3.5+。手册中部分代码是说明机制的片段，Pinia 示例仅作为学习内容，不在本应用安装 Pinia。

## 结构

```text
src/
  main.ts                 # Vue 实例与 qiankun 生命周期
  public-path.ts          # qiankun 注入的分包地址
  router/index.ts         # 独立 / 嵌入式路由与手册懒加载
  components/             # 布局、Vue 标识、代码、知识正文与演示
  pages/                  # 工作室五页面与 Vue 手册
  content/handbook.ts      # 知识条目、面试题与检索逻辑
  styles.css              # 根节点限定的绿色主题和响应式布局
```

## qiankun 接入

- UMD 名称 `appQiankunVue`，导出 `bootstrap` / `mount` / `unmount`。
- 挂载节点只在传入 `container` 内查找；未嵌入宿主时自动独立挂载。
- `createWebHistory(basePath)` 使用宿主前缀 `/apps/app-qiankun-vue`。每次挂载独立创建 app 与 router；卸载销毁应用与 history 监听。
- 全部样式限定到 `#app-qiankun-vue-root`，宿主继续使用 qiankun 的实验性样式隔离。
- 手册异步分包使用注入的 publicPath；生产构建可通过 `npm run build -- --env publicPath=https://child.example.com/` 设置部署地址。静态服务需配置跨域响应头和 HTML history 回退。

## 验证

`npm test` 先构建真实生产包，再通过 Node + jsdom 检查独立挂载、宿主容器隔离、五页面导航、深链懒加载、检索筛选、答案展开、代码复制、交互演示和卸载后重挂载。测试资源只读取本地 dist，不启动浏览器，也不发真实网络请求。
