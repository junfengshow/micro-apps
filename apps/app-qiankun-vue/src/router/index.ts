import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import HomePage from "../pages/HomePage.vue";
import ProductsPage from "../pages/ProductsPage.vue";
import SolutionsPage from "../pages/SolutionsPage.vue";
import AboutPage from "../pages/AboutPage.vue";
import ContactPage from "../pages/ContactPage.vue";

export function createAppRouter(basePath = "/") {
  const history = createWebHistory(basePath);
  const base = history.base.toLowerCase();
  if (base) {
    const listen = history.listen;
    // qiankun 会把主应用的 History 事件转发给仍在挂载的 Vue 应用。
    // 路径离开挂载前缀时交由主应用处理，避免 Vue 的兜底路由把地址改回首页。
    history.listen = (listener) =>
      listen((to, from, info) => {
        const pathname = window.location.pathname.toLowerCase();
        if (pathname === base || pathname.startsWith(`${base}/`)) {
          listener(to, from, info);
        }
      });
  }

  return createRouter({
    history,
    routes: [
      { path: "/vue", component: () => import("../pages/VuePage.vue") },
      {
        path: "/",
        component: AppLayout,
        children: [
          { path: "", component: HomePage },
          { path: "products", component: ProductsPage },
          { path: "solutions", component: SolutionsPage },
          { path: "about", component: AboutPage },
          { path: "contact", component: ContactPage },
        ],
      },
      { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
  });
}
