const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 以 app-master 为路径基准，避免从仓库根目录执行命令时改变资源定位。
const root = path.resolve(__dirname, "..");

module.exports = ({ mode, basePath, entries, federationEntry }) => ({
  mode,
  context: root,
  // main.tsx 通过异步 import 启动应用，为模块联邦初始化共享依赖留出边界。
  entry: "./src/main.tsx",
  output: {
    path: path.join(root, "dist"),
    // 入口、异步分包与静态资源分别存放，内容哈希用于更新后的缓存失效。
    filename: "assets/js/[name].[contenthash:8].js",
    chunkFilename: "assets/js/[name].[contenthash:8].chunk.js",
    assetModuleFilename: "assets/media/[name].[contenthash:8][ext]",
    // 异步资源跟随实际加载的运行时脚本，部署时可以更换域名或路径。
    publicPath: "auto",
    // 主应用使用独立的 Webpack 运行时标识，避免和同页子应用冲突。
    uniqueName: "app-master",
    clean: true,
    // 异步 JS 分包加载超过 15 秒即失败，交由页面展示错误并允许重试。
    chunkLoadTimeout: 15000,
  },
  resolve: {
    // import 可省略这些扩展名，按数组顺序尝试解析。
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: {
      // 与 tsconfig.json 的 @/* 保持一致：这里负责打包时的路径解析。
      "@": path.join(root, "src"),
      // 未配置联邦入口时，菜单不注册该应用，构建也跳过远端模块。
      ...(federationEntry ? {} : { "appFederation/mount$": false }),
    },
  },
  module: {
    rules: [
      {
        // TypeScript/TSX 交给 ts-loader，第三方依赖不重复转译。
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        // 只做转译，类型检查由 typecheck 命令负责，生产构建会先检查。
        // 覆盖 tsconfig 的 noEmit，允许 loader 向 Webpack 提交转译后的 JS。
        options: { transpileOnly: true, compilerOptions: { noEmit: false } },
      },
      {
        test: /\.css$/,
        use: [
          // loader 从后往前执行：PostCSS → CSS 解析 → 开发时注入/生产时提取。
          mode === "production" ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              // 固定 PostCSS 配置位置，启用主应用的 Tailwind 插件。
              postcssOptions: { config: path.join(root, "postcss.config.cjs") },
            },
          },
        ],
      },
      // 图片与字体输出为独立文件，import 得到最终资源 URL。
      { test: /\.(png|jpe?g|gif|svg|webp|woff2?)$/i, type: "asset/resource" },
    ],
  },
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      // 宿主联邦容器名；远端容器名则由下面 remotes 中的 @ 前缀指定。
      name: "appMaster",
      remotes: federationEntry
        ? { appFederation: `appFederation@${federationEntry}` }
        : {},
      shared: {
        // 主、子应用共享 React 与根渲染入口单例；版本范围需与远端保持兼容。
        react: { singleton: true, requiredVersion: "^19.2.0" },
        "react-dom/client": { singleton: true, requiredVersion: "^19.2.0" },
      },
    }),
    // 深层路由刷新时，入口 HTML 仍从主应用部署路径加载脚本。
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      publicPath: basePath,
    }),
    new webpack.DefinePlugin({
      __MASTER_BASE_PATH__: JSON.stringify(basePath),
      __MICRO_ENTRIES__: JSON.stringify(entries),
    }),
  ],
});
