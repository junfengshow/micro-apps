const { readFileSync } = require("node:fs");
const path = require("node:path");
const { parseEnv } = require("node:util");
const { merge } = require("webpack-merge");
const common = require("./config/webpack.common.cjs");
const development = require("./config/webpack.dev.cjs");
const production = require("./config/webpack.prod.cjs");

module.exports = (_env, argv = {}) => {
  const mode = argv.mode || "development";
  const isProduction = mode === "production";

  // 第一步，读取当前环境的默认配置，部署平台或命令行传入的变量优先。
  const defaults = parseEnv(
    readFileSync(
      path.join(
        __dirname,
        isProduction ? ".env.production" : ".env.development"
      ),
      "utf8"
    )
  );
  const setting = (name) => (process.env[name] ?? defaults[name])?.trim() || "";
  const basePath = setting("APP_MASTER_BASE_PATH") || "/";
  const federationEntry = setting("FEDERATION_ENTRY");
  const entries = {
    "app-qiankun-vue": setting("QIANKUN_VUE_ENTRY"),
    "app-micro-app": setting("MICRO_APP_ENTRY"),
    "app-wujie-angular": setting("WUJIE_ANGULAR_ENTRY"),
    "app-federation": federationEntry,
    "app-vite-react": setting("VITE_REACT_ENTRY"),
    "app-react-source": setting("REACT_SOURCE_ENTRY"),
  };

  // 第二步，将同一组入口注入菜单和模块联邦配置，再合并环境规则。
  return merge(
    common({ mode, basePath, entries, federationEntry }),
    isProduction ? production : development
  );
};
