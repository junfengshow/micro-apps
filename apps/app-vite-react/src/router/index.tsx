import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { AppLayout } from "../layouts/AppLayout";
import { AboutPage } from "../pages/about/AboutPage";
import { ContactPage } from "../pages/contact/ContactPage";
import { HomePage } from "../pages/home/HomePage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { SolutionsPage } from "../pages/solutions/SolutionsPage";

// 子页面使用相对路径，可同时用于独立运行和带 basePath 的微前端挂载。
export const routes: RouteObject[] = [
  // 学习手册有自己的页面结构，与工作室布局并列，并按需加载。
  {
    path: "react",
    HydrateFallback: () => (
      <div
        role="status"
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          background: "#f6f8f5",
          color: "#1d3030",
        }}
      >
        正在加载 React 知识手册…
      </div>
    ),
    lazy: async () => {
      const { ReactPage } = await import("../pages/react/ReactPage");
      return { Component: ReactPage };
    },
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "solutions", element: <SolutionsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      // 未匹配地址回到当前路由基路径下的首页，replace 避免留下无效历史记录。
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export function createAppRouter(basename = "/") {
  // 独立运行与 micro-app 虚拟路由使用 /；qiankun 可传入主应用的挂载路径。
  return createBrowserRouter(routes, { basename });
}
