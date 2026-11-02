const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 以 app-master 为路径基准，避免从仓库根目录执行命令时改变资源定位。
const root = path.resolve(__dirname, "..");

module.exports = ({ engine, mode }) => ({
  mode,
  context: root,
  // main.tsx 通过异步 import 启动应用，为模块联邦初始化共享依赖留出边界。
  entry: "./src/main.tsx",
  output: {
    // 全引擎模式与单引擎菜单模式分别输出。
    path: path.join(root, "dist", engine),
    // 入口、异步分包与静态资源分别存放，内容哈希用于更新后的缓存失效。
    filename: "assets/js/[name].[contenthash:8].js",
    chunkFilename: "assets/js/[name].[contenthash:8].chunk.js",
    assetModuleFilename: "assets/media/[name].[contenthash:8][ext]",
    // 主应用部署在站点根路径，异步资源始终从根路径加载。
    publicPath: "/",
    // 区分不同构建的 Webpack 运行时，避免共用页面时全局标识冲突。
    uniqueName: `app-master-${engine}`,
    // 仅清理当前 engine 对应的输出目录。
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
      // 生产部署时通过 FEDERATION_ENTRY 指向实际远端；默认使用本地演示服务。
      remotes: {
        appFederation: `appFederation@${process.env.FEDERATION_ENTRY || "http://localhost:7104/remoteEntry.js"}`,
      },
      shared: {
        // 主、子应用共享 React 与根渲染入口单例；版本范围需与远端保持兼容。
        react: { singleton: true, requiredVersion: "^19.2.0" },
        "react-dom/client": { singleton: true, requiredVersion: "^19.2.0" },
      },
    }),
    // 从模板生成入口 HTML，自动注入带内容哈希的构建脚本。
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    // 编译期注入菜单筛选常量，JSON.stringify 确保替换结果是字符串字面量。
    new webpack.DefinePlugin({ __MICRO_ENGINE__: JSON.stringify(engine) }),
  ],
});
