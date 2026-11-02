import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import HomePage from "../pages/HomePage.vue";
import ProductsPage from "../pages/ProductsPage.vue";
import SolutionsPage from "../pages/SolutionsPage.vue";
import AboutPage from "../pages/AboutPage.vue";
import ContactPage from "../pages/ContactPage.vue";

export function createAppRouter(basePath = "/") {
  return createRouter({
    history: createWebHistory(basePath),
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
