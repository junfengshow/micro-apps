<script setup lang="ts">
import VueMark from "../components/VueMark.vue";
</script>
<template>
  <section class="home-hero">
    <div class="hero-copy">
      <p class="eyebrow"><i /> SMALL IDEAS. REAL POSSIBILITIES.</p>
      <h1>让好的想法，<br /><span class="gradient-text">自然生长。</span></h1>
      <p class="hero-description">
        以清晰的设计，连接可靠的技术。<br />我们把每一个小小的灵感，变成触手可及的数字体验。
      </p>
      <div class="actions">
        <RouterLink to="/products" class="button"
          >探索我们的产品 <span>→</span></RouterLink
        ><RouterLink to="/about" class="text-link"
          >认识 Vue Studio ↗</RouterLink
        >
      </div>
      <div class="hero-caption">
        <span class="little-line" /> 保持好奇 · 认真创造 · 持续进化
      </div>
    </div>
    <div class="hero-garden" aria-label="由 Vue 标志和绿色卡片构成的创意花园">
      <div class="garden-grid" />
      <div class="garden-label">
        <span class="status-dot" /> A LITTLE IDEA, A NEW BEGINNING
      </div>
      <div class="garden-orbit orbit-one" />
      <div class="garden-orbit orbit-two" />
      <VueMark class="garden-logo" />
      <div class="garden-chip chip-top"><span>✦</span> 好奇心，是起点。</div>
      <div class="garden-card">
        <span class="eyebrow">GROW SOMETHING GOOD</span
        ><strong>从一个想法，<br />到无限可能。</strong
        ><span class="garden-arrow">↗</span>
      </div>
      <span class="garden-bottom">DESIGNED WITH CARE / BUILT WITH VUE</span>
    </div>
  </section>
  <section class="principles" aria-label="我们的关注点">
    <div>
      <span>01 / DESIGN</span>
      <h2>让复杂变简单</h2>
      <p>用清晰的设计，让每一步都有方向。</p>
    </div>
    <div>
      <span>02 / BUILD</span>
      <h2>让想法落到实处</h2>
      <p>从可用的小产品开始，认真打磨细节。</p>
    </div>
    <div>
      <span>03 / GROW</span>
      <h2>在反馈中持续生长</h2>
      <p>倾听真实的声音，找到下一步的可能。</p>
    </div>
  </section>
  <section class="home-discover">
    <div class="section-heading">
      <div>
        <p class="eyebrow">EXPLORE THE STUDIO</p>
        <h2>下一份灵感，从这里开始。</h2>
      </div>
      <RouterLink class="text-link" to="/products">查看全部产品 ↗</RouterLink>
    </div>
    <div class="discover-grid">
      <RouterLink to="/vue" class="discover-feature"
        ><span class="eyebrow">THE VUE HANDBOOK</span>
        <h3>理解原理，<br />也写出好代码。</h3>
        <p>从响应式到组件设计，<br />把 Vue 知识和面试准备连成一条线。</p>
        <span class="feature-link">打开 Vue 知识手册 <b>↗</b></span
        ><VueMark
      /></RouterLink>
      <RouterLink to="/solutions" class="discover-card"
        ><span class="card-index">01 / OUR APPROACH</span
        ><span class="discover-symbol">⌘</span>
        <h3>把问题变成可能</h3>
        <p>发现、验证、交付。看看我们如何让想法一步步落地。</p>
        <span class="card-arrow">↗</span></RouterLink
      >
      <RouterLink to="/contact" class="discover-card contact-card"
        ><span class="card-index">02 / SAY HELLO</span
        ><span class="discover-symbol">✳</span>
        <h3>一起做点有趣的事</h3>
        <p>带着你的灵感来，下一件好作品，或许就从一次对话开始。</p>
        <span class="card-arrow">↗</span></RouterLink
      >
    </div>
  </section>
</template>
