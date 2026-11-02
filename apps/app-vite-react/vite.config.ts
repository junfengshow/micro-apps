import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";

export default defineConfig(({ command, isPreview }) => {
  // 仅开发服务器启用 qiankun 开发桥接；生产构建和产物预览走非开发模式。
  const useQiankunDevMode = command === "serve" && !isPreview;

  return {
    // 将声明的 React 版本注入页面，随 package.json 一起更新。
    define: {
      __REACT_VERSION__: JSON.stringify(dependencies.react),
    },
    // qiankun 通过动态 import 加载模块，资源必须指向子应用服务。
    // 部署时可通过 vite build --base=<子应用资源地址> 覆盖。
    base: "http://localhost:7100/",
    plugins: [
      // qiankun 开发桥接时不启用 React Fast Refresh，避免注入的运行时不兼容。
      ...(!useQiankunDevMode ? [react()] : []),
      // 应用名与生命周期注册保持一致；该桥接也保留独立运行能力。
      qiankun("app-vite-react", { useDevMode: useQiankunDevMode }),
    ],
    server: {
      // 与主应用注册的 http://localhost:7100/ 入口保持一致。
      host: "localhost",
      // 指定开发资源的完整来源，嵌入主应用时仍从子应用服务加载。
      origin: "http://localhost:7100",
      port: 7100,
      // 端口占用时直接失败，防止 Vite 换端口后与主应用注册入口不一致。
      strictPort: true,
      // 允许其他来源的主应用读取开发入口和模块资源。
      cors: true,
    },
    // npm run preview 用同一地址提供 dist 产物，方便主应用加载本地生产构建。
    preview: {
      host: "localhost",
      port: 7100,
      // 预览同样固定端口并允许主应用跨域读取；正式静态服务需另行配置。
      strictPort: true,
      cors: true,
    },
  };
});
