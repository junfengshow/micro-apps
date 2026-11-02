<script setup lang="ts">
const products = [
  {
    name: "灵感盒子",
    category: "CREATE",
    symbol: "▦",
    text: "随手收集、整理和连接灵感，让好点子有迹可循。",
    status: "即将上线",
  },
  {
    name: "慢一点",
    category: "FOCUS",
    symbol: "◷",
    text: "一款轻量的专注计时器，帮你把注意力还给眼前的事。",
    status: "公开测试中",
  },
  {
    name: "一起做",
    category: "CONNECT",
    symbol: "✳",
    text: "把想法变成一个共同的小目标，和伙伴一起稳稳向前。",
    status: "持续探索",
  },
];
</script>
<template>
  <section class="inner-page">
    <p class="eyebrow">OUR PRODUCTS / 我们的产品</p>
    <div class="page-heading">
      <h1>为日常创造<br /><span class="gradient-text">一点新可能。</span></h1>
      <p>认真打磨的小工具，<br />让灵感和工作都更顺手。</p>
    </div>
    <div class="product-grid">
      <article
        v-for="(product, index) in products"
        :key="product.name"
        class="product-card"
      >
        <span class="eyebrow">0{{ index + 1 }} / {{ product.category }}</span
        ><span class="product-symbol">{{ product.symbol }}</span>
        <h2>{{ product.name }}</h2>
        <p>{{ product.text }}</p>
        <span class="badge">{{ product.status }}</span>
      </article>
    </div>
    <p class="page-footnote">
      产品概念展示 · 每个产品都从一个真实的小问题开始。
    </p>
  </section>
</template>
