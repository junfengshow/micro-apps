import type { Routes } from "@angular/router";
import {
  HomePage,
  ProductsPage,
  SolutionsPage,
  AboutPage,
  ContactPage,
} from "./pages/components";
import { HandbookComponent } from "./handbook/handbook.component";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    component: HomePage,
    title: "首页 · Angular Studio",
  },
  { path: "products", component: ProductsPage, title: "产品 · Angular Studio" },
  {
    path: "solutions",
    component: SolutionsPage,
    title: "方案 · Angular Studio",
  },
  { path: "about", component: AboutPage, title: "关于 · Angular Studio" },
  { path: "contact", component: ContactPage, title: "联系 · Angular Studio" },
  {
    path: "angular",
    component: HandbookComponent,
    title: "Angular 知识手册 · Angular Studio",
  },
  { path: "**", redirectTo: "" },
];
