const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  // 生产构建不生成源码映射文件。
  devtool: false,
  plugins: [
    // 将样式提取为独立 CSS；内容变化时更新文件名，便于浏览器缓存。
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].[contenthash:8].css",
    }),
  ],
  optimization: {
    // 入口共享一个运行时，减少运行时代码重复并便于独立缓存。
    runtimeChunk: "single",
    // 同时分析同步和异步模块，将可复用的依赖拆成共享分包。
    splitChunks: { chunks: "all" },
    // “...”保留 Webpack 默认 JS 压缩器，另加 CSS 压缩。
    minimizer: ["...", new CssMinimizerPlugin()],
  },
};
