module.exports = {
  // 开发时快速生成源码映射，便于定位 TS/TSX 行号，不追求列级精度。
  devtool: "eval-cheap-module-source-map",
  devServer: {
    // 主应用本地访问地址；修改端口时同步调整检查脚本的 MASTER_PORT。
    host: "localhost",
    port: 3000,
    // BrowserRouter 的深层链接刷新时返回主应用入口。
    historyApiFallback: true,
    // 主应用启用热更新；启动服务时不自动打开浏览器。
    hot: true,
    open: false,
    // 页面遮罩只显示编译错误，警告仍可从终端查看。
    client: { overlay: { errors: true, warnings: false } },
  },
  // 终端省略构建资源清单，保留错误与警告。
  stats: "errors-warnings",
};
