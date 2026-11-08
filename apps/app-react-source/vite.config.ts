import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";
import { defineConfig } from "vite";

const built = fileURLToPath(
  new URL("./vendor/react/build/node_modules/", import.meta.url)
);
const manifest = new URL("./.cache/react-build.json", import.meta.url);
const entries = [
  ["react", "react/index.js"],
  ["react/jsx-runtime", "react/jsx-runtime.js"],
  ["react/jsx-dev-runtime", "react/jsx-dev-runtime.js"],
  ["react-dom", "react-dom/index.js"],
  ["react-dom/client", "react-dom/client.js"],
  ["scheduler", "scheduler/index.js"],
] as const;

export default defineConfig(({ command, isPreview }) => {
  if (
    !existsSync(manifest) ||
    entries.some(([, path]) => !existsSync(`${built}${path}`))
  ) {
    throw new Error("缺少 React 本地构建产物，请先执行 npm run react:setup。");
  }
  if (
    command === "build" &&
    !existsSync(`${built}react/cjs/react.production.js`)
  ) {
    throw new Error(
      "当前只有 React 开发包。打包生产应用前，请执行 npm run react:build -- --production；日常调试使用 npm run dev。"
    );
  }
  const useDevMode = command === "serve" && !isPreview;
  return {
    base: "http://localhost:7105/",
    define: {
      __REACT_SOURCE_BUILD__: readFileSync(manifest, "utf8"),
    },
    // micro-app 加载 Vite ESM 时沿用仓库既有 qiankun 开发桥接。
    plugins: [
      ...(!useDevMode ? [react()] : []),
      qiankun("app-react-source", { useDevMode }),
    ],
    resolve: {
      // 精确匹配每个入口，React、DOM、JSX 和 Scheduler 全部来自同一次源码构建。
      alias: entries.map(([name, path]) => ({
        find: new RegExp(`^${name.replaceAll("/", "\\/")}$`),
        replacement: `${built}${path}`,
      })),
    },
    optimizeDeps: {
      // 完整上游仓库包含许多 fixture HTML，只扫描当前应用入口。
      entries: ["index.html"],
      // 官方产物是 CommonJS，需要 Vite 预打包；每次启动重建缓存以读取最新日志。
      include: entries.map(([name]) => name),
      force: true,
    },
    build: { sourcemap: true },
    server: {
      host: "localhost",
      origin: "http://localhost:7105",
      port: 7105,
      strictPort: true,
      cors: true,
      // React 源码改动由手动构建消费，避免监听整个上游仓库。
      watch: { ignored: ["**/vendor/react/**"] },
    },
    preview: { host: "localhost", port: 7105, strictPort: true, cors: true },
  };
});
