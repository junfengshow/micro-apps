const { merge } = require("webpack-merge");
const common = require("./config/webpack.common.cjs");
const development = require("./config/webpack.dev.cjs");
const production = require("./config/webpack.prod.cjs");

module.exports = (_env, argv = {}) => {
  const mode = argv.mode || "development";
  const basePath = process.env.APP_MASTER_BASE_PATH?.trim() || "/";

  // 第一步，确定子应用入口。只有开发环境会回退到本地服务。
  const entry = (configured, port, pathname = "/") =>
    configured?.trim() ||
    (mode === "production" ? "" : `http://localhost:${port}${pathname}`);
  const federationEntry = entry(
    process.env.FEDERATION_ENTRY,
    7104,
    "/remoteEntry.js"
  );
  const entries = {
    "app-qiankun-vue": entry(process.env.QIANKUN_VUE_ENTRY, 7101),
    "app-micro-app": entry(process.env.MICRO_APP_ENTRY, 7102),
    "app-wujie-angular": entry(process.env.WUJIE_ANGULAR_ENTRY, 7103),
    "app-federation": federationEntry,
    "app-vite-react":
      entry(process.env.VITE_REACT_ENTRY, 7100) ||
      "https://app-vite-react-gules.vercel.app/",
    "app-react-source": entry(process.env.REACT_SOURCE_ENTRY, 7105),
  };

  // 第二步，将同一组入口注入菜单和模块联邦配置，再合并环境规则。
  return merge(
    common({ mode, basePath, entries, federationEntry }),
    mode === "production" ? production : development
  );
};
