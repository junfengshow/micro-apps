import { createBrowserRouter } from "react-router";
import { MasterLayout } from "@/layouts/MasterLayout";

// 使用 History 路由；开发和生产服务器都需将页面深层链接回退到 index.html。
export const router = createBrowserRouter([
  {
    // 首页、子应用页和未找到页共用侧边栏与内容布局。
    element: <MasterLayout />,
    children: [
      {
        // 默认首页不占用子应用挂载区域，页面模块按需下载。
        index: true,
        lazy: async () => ({
          Component: (await import("@/pages/HomePage")).HomePage,
        }),
      },
      // name 对应注册表名称；尾部 * 接收子应用的深层路径，页面模块懒加载。
      {
        path: "apps/:name/*",
        lazy: async () => ({
          Component: (await import("@/pages/MicroAppPage")).MicroAppPage,
        }),
      },
      {
        // 主应用未匹配的地址显示 404 页面。
        path: "*",
        lazy: async () => ({
          Component: (await import("@/pages/NotFoundPage")).NotFoundPage,
        }),
      },
    ],
  },
]);
