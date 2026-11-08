const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 各子应用独立构建；--mode production 启用生产优化，默认使用开发模式。
module.exports = (env = {}, argv = {}) => ({
  mode: argv.mode || "development",
  // 所有相对入口和模板路径均以当前应用目录为基准。
  context: __dirname,
  // 异步启动入口先初始化共享依赖，再加载 React 渲染代码。
  entry: "./src/main.tsx",
  output: {
    // 构建结果只写入当前子应用的 dist，构建前清理旧产物。
    path: path.join(__dirname, "dist"),
    // 内容哈希用于缓存失效；异步分包和入口采用相同的命名规则。
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].js",
    // auto 从当前脚本 URL 推导资源路径，让远端分包跟随 remoteEntry 所在服务。
    // 生产部署可传 --env publicPath=https://child.example.com/ 覆盖（保留末尾 /）。
    publicPath: env.publicPath || "auto",
    // 各应用使用不同的运行时标识，避免同页加载时发生全局变量冲突。
    uniqueName: "app-federation",
    clean: true,
  },
  // import 可省略这些扩展名，优先解析 TSX/TS 源码。
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        // 只转译；类型检查由 typecheck 负责，build 命令会先执行类型检查。
        // noEmit: false 覆盖 tsconfig 的检查模式，允许 loader 输出 JS。
        options: { transpileOnly: true, compilerOptions: { noEmit: false } },
      },
      {
        test: /\.module\.css$/,
        // 从右往左执行：css-loader 处理 CSS Modules，style-loader 注入样式。
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                // 与 import styles from './App.module.css' 的默认导入写法一致。
                namedExport: false,
                // 应用前缀 + 原类名 + 哈希，减少不同子应用间的样式冲突。
                localIdentName: "federation_[local]_[hash:base64:5]",
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 生成可独立访问、也可由 HTML 入口引擎加载的页面，自动注入脚本。
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    new webpack.container.ModuleFederationPlugin({
      // 容器名需与主应用 remotes 中 @ 之前的 appFederation 完全一致。
      name: "appFederation",
      // 远端清单固定命名，供主应用首次发现并加载联邦模块。
      filename: "remoteEntry.js",
      // 主应用通过 import('appFederation/mount') 获取挂载函数。
      exposes: { "./mount": "./src/render.tsx" },
      shared: {
        // 与宿主共享 React 和根渲染入口单例，版本范围需保持兼容。
        react: { singleton: true, requiredVersion: "^19.2.0" },
        "react-dom/client": { singleton: true, requiredVersion: "^19.2.0" },
      },
    }),
  ],
  devServer: {
    // 本地端口须与主应用构建配置中的默认开发入口保持一致。
    host: "localhost",
    port: 7104,
    // 允许不同端口的主应用读取入口与脚本；此处仅配置开发服务器。
    headers: { "Access-Control-Allow-Origin": "*" },
    // 独立访问时，页面深层链接回退到入口 HTML。
    historyApiFallback: true,
    // 关闭热更新、自动刷新和开发客户端，避免沙箱内执行 WebSocket 全局逻辑。
    hot: false,
    liveReload: false,
    client: false,
    // 启动服务时不自动打开浏览器。
    open: false,
  },
  // 开发构建生成独立源码映射，生产构建关闭源码映射。
  devtool: argv.mode === "production" ? false : "source-map",
  // 不额外提取运行时和共享分包，简化子应用入口的脚本加载关系。
  optimization: { runtimeChunk: false, splitChunks: false },
});
