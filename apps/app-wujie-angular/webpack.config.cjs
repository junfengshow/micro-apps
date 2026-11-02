const path = require("node:path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { AngularWebpackPlugin } = require("@ngtools/webpack");

// 各子应用独立构建；--mode production 启用生产优化，默认使用开发模式。
module.exports = async (env = {}, argv = {}) => {
  const { default: linker } =
    await import("@angular/compiler-cli/linker/babel");
  return {
    mode: argv.mode || "development",
    // 所有相对入口和模板路径均以当前应用目录为基准。
    context: __dirname,
    // 入口同时处理独立运行和微前端生命周期注册。
    entry: "./src/main.ts",
    output: {
      // 构建结果只写入当前子应用的 dist，构建前清理旧产物。
      path: path.join(__dirname, "dist"),
      // 内容哈希用于缓存失效；异步分包和入口采用相同的命名规则。
      filename: "[name].[contenthash:8].js",
      chunkFilename: "[name].[contenthash:8].js",
      // 绝对资源地址避免嵌入主应用后，从主应用域名误加载子应用分包。
      // 生产部署可传 --env publicPath=https://child.example.com/ 覆盖（保留末尾 /）。
      publicPath: env.publicPath || "http://localhost:7103/",
      // 各应用使用不同的运行时标识，避免同页加载时发生全局变量冲突。
      uniqueName: "app-wujie-angular",
      clean: true,
    },
    // TypeScript 源码与现代 Angular ESM 依赖。
    resolve: { extensions: [".ts", ".mjs", ".js"] },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          // Angular 编译器执行 AOT，同时编译模板和 TypeScript。
          loader: "@ngtools/webpack",
        },
        {
          test: /\.[cm]?js$/,
          include: /node_modules[\/]@angular/,
          // 将 Angular 依赖的 partial declarations 链接为可执行 AOT 定义。
          loader: "babel-loader",
          options: {
            configFile: false,
            babelrc: false,
            compact: false,
            plugins: [linker],
          },
        },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
        {
          test: /\.html$/,
          include: path.join(__dirname, "src"),
          type: "asset/source",
        },
      ],
    },
    plugins: [
      // 编译期标记让压缩器移除 Angular 开发检查及 JIT 分支。
      new DefinePlugin({
        ngJitMode: false,
        ngI18nClosureMode: false,
        ...(argv.mode === "production" ? { ngDevMode: false } : {}),
      }),
      new AngularWebpackPlugin({
        tsconfig: path.join(__dirname, "tsconfig.json"),
        jitMode: false,
      }),
      // 生成可独立访问、也可由 HTML 入口引擎加载的页面，自动注入脚本。
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
    ],
    devServer: {
      // 本地地址须与主应用 src/micro/apps.ts 的注册入口保持一致。
      host: "localhost",
      port: 7103,
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
  };
};
