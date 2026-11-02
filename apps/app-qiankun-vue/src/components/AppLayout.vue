<script setup lang="ts">
import VueMark from "./VueMark.vue";
const navigation = [
  { to: "/", label: "首页" },
  { to: "/products", label: "产品" },
  { to: "/solutions", label: "解决方案" },
  { to: "/about", label: "关于我们" },
  { to: "/contact", label: "联系我们" },
];
</script>
<template>
  <div class="studio-shell">
    <header class="topbar">
      <RouterLink to="/" class="brand" aria-label="Vue Studio 首页"
        ><VueMark /><span
          >vue<span class="brand-light"> studio</span></span
        ></RouterLink
      >
      <nav aria-label="主导航">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          active-class=""
          exact-active-class="nav-active"
          >{{ item.label }}</RouterLink
        >
      </nav>
      <RouterLink to="/vue" class="button button-small"
        >Vue 知识手册 <span aria-hidden="true">↗</span></RouterLink
      >
    </header>
    <main id="studio-content"><RouterView /></main>
    <footer class="studio-footer">
      <RouterLink to="/" class="brand"><VueMark />vue studio</RouterLink
      ><span>让想法生长，让体验更简单。</span><span>© 2026 Vue Studio</span>
    </footer>
  </div>
</template>
