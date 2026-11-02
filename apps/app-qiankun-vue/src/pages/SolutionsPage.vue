<script setup lang="ts">
const steps = [
  {
    title: "一起发现问题",
    text: "先听清楚，再定义什么才是真正值得解决的事。通过沟通，把模糊的想法整理成清晰的目标。",
    label: "DISCOVER",
  },
  {
    title: "做出可触摸的想法",
    text: "用原型快速验证，让讨论建立在真实体验之上。小步尝试，找到最适合的产品方向。",
    label: "DESIGN & BUILD",
  },
  {
    title: "持续交付价值",
    text: "从小步上线开始，观察反馈，让产品在使用中变好。每次迭代，都向真正的需求靠近一点。",
    label: "EVOLVE",
  },
];
</script>
<template>
  <section class="inner-page">
    <p class="eyebrow">OUR APPROACH / 我们的方式</p>
    <div class="page-heading">
      <h1>从问题出发，<br />让答案<span class="gradient-text">落地。</span></h1>
      <p>不追赶潮流，<br />专注于找到适合你的那条路。</p>
    </div>
    <div class="solution-list">
      <article v-for="(step, index) in steps" :key="step.label">
        <span class="step-number">0{{ index + 1 }}</span>
        <div>
          <span class="eyebrow">{{ step.label }}</span>
          <h2>{{ step.title }}</h2>
        </div>
        <p>{{ step.text }}</p>
        <span aria-hidden="true">↗</span>
      </article>
    </div>
    <blockquote>
      “最好的解决方案，往往从一个好问题开始。”<small
        >Vue Studio 的工作信条</small
      >
    </blockquote>
  </section>
</template>
