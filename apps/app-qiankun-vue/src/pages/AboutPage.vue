<script setup lang="ts">
import VueMark from "../components/VueMark.vue";
</script>
<template>
  <section class="inner-page">
    <p class="eyebrow">ABOUT THE STUDIO / 关于我们</p>
    <div class="page-heading">
      <h1>保持好奇，<br /><span class="gradient-text">一起创造。</span></h1>
      <p>我们喜欢把复杂事情讲清楚、做简单，<br />也相信每一个小小的好想法。</p>
    </div>
    <div class="about-story">
      <div class="about-art">
        <span class="eyebrow">STAY CURIOUS. KEEP GROWING.</span><VueMark /><span
          >做点有意思的事 ✦</span
        >
      </div>
      <div>
        <p class="eyebrow">A SMALL STUDIO WITH BIG CURIOSITY</p>
        <h2>让好体验，<br />成为生活的一部分。</h2>
        <p>
          我们相信，技术不该增加距离，设计也不只是装饰。好的数字产品能让事情更清楚，让人与人之间的协作更轻松。
        </p>
        <p>
          这个工作室示例记录我们对产品与技术的探索：打造贴近日常的小产品，也分享能真正用起来的
          Vue 知识。
        </p>
        <RouterLink class="text-link" to="/contact">来认识一下 →</RouterLink>
      </div>
    </div>
    <div class="principles">
      <div>
        <span>01</span>
        <h2>保持好奇</h2>
        <p>多问一个为什么。</p>
      </div>
      <div>
        <span>02</span>
        <h2>认真倾听</h2>
        <p>先理解，再行动。</p>
      </div>
      <div>
        <span>03</span>
        <h2>持续打磨</h2>
        <p>每次都比上次好一点。</p>
      </div>
    </div>
  </section>
</template>
