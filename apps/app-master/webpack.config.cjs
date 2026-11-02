const { merge } = require("webpack-merge");
const common = require("./config/webpack.common.cjs");
const development = require("./config/webpack.dev.cjs");
const production = require("./config/webpack.prod.cjs");

// 引擎和构建环境是两个独立维度：默认运行全部引擎，也可按引擎筛选菜单。
module.exports = (env = {}, argv = {}) => {
  // --env engine=... 只筛选可见应用；all 保留四种引擎及已有 Vite 应用。
  const engine = env.engine || "all";
  if (
    !["all", "qiankun", "micro-app", "wujie", "federation"].includes(engine)
  ) {
    throw new Error(`不支持的微前端引擎：${engine}`);
  }
  // --mode 决定开发/生产配置，与菜单筛选互不影响。
  const mode = argv.mode || "development";
  // 先加载公共规则，再合并对应环境的服务、调试或压缩选项。
  return merge(
    common({ engine, mode }),
    mode === "production" ? production : development
  );
};
