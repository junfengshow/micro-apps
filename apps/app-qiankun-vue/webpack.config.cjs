const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = (env = {}, argv = {}) => ({
  mode: argv.mode || "development",
  context: __dirname,
  entry: "./src/main.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].js",
    // qiankun 挂载时由 public-path.ts 使用宿主注入的资源地址。
    publicPath: env.publicPath || "http://localhost:7101/",
    uniqueName: "app-qiankun-vue",
    library: { name: "appQiankunVue", type: "umd" },
    globalObject: "window",
    clean: true,
  },
  resolve: { extensions: [".ts", ".js", ".vue"] },
  module: {
    rules: [
      { test: /\.vue$/, loader: "vue-loader" },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
          compilerOptions: { noEmit: false },
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }),
  ],
  devServer: {
    host: "localhost",
    port: 7101,
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    client: false,
    open: false,
  },
  devtool: argv.mode === "production" ? false : "source-map",
  optimization: { runtimeChunk: false, splitChunks: false },
});
