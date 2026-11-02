import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import "./styles/index.css";

// 引擎生命周期自行管理；这里不启用开发模式的 StrictMode 双重挂载。
// Ant Design 使用中文语言包，主题 token 统一设置品牌主色和组件圆角。
createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    locale={zhCN}
    theme={{ token: { colorPrimary: "#2563eb", borderRadius: 8 } }}
  >
    <RouterProvider router={router} />
  </ConfigProvider>
);
