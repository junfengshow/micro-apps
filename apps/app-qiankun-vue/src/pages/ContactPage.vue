<script setup lang="ts">
import { ref } from "vue";
const submitted = ref(false);
</script>
<template>
  <section class="inner-page">
    <p class="eyebrow">SAY HELLO / 联系我们</p>
    <div class="page-heading">
      <h1>
        下一件有趣的事，<br /><span class="gradient-text">从这里开始。</span>
      </h1>
      <p>有想法、有问题，或者只是想打个招呼？<br />我们都很乐意听。</p>
    </div>
    <div class="contact-layout">
      <div class="contact-note">
        <p class="eyebrow">LET'S MAKE SOMETHING GOOD</p>
        <h2>留下一点灵感，<br />让新的可能发生。</h2>
        <a class="email-link" href="mailto:hello@example.com"
          >hello@example.com ↗</a
        >
        <p>示例联系邮箱 · 表单仅用于本地体验</p>
        <span class="contact-flower" aria-hidden="true">✳</span>
      </div>
      <form
        class="contact-form"
        @submit.prevent="submitted = true"
        @input="submitted = false"
      >
        <label
          >怎么称呼你？<input
            name="name"
            autocomplete="name"
            placeholder="你的名字"
            required /></label
        ><label
          >联系邮箱<input
            name="email"
            autocomplete="email"
            type="email"
            placeholder="name@example.com"
            required /></label
        ><label
          >想聊些什么？<textarea
            name="message"
            placeholder="简单说说你的想法……"
            rows="5"
            required
          /></label
        ><button class="button" type="submit">体验提交 <span>→</span></button>
        <p v-if="submitted" role="status" class="success-message">
          谢谢你！这是一份演示表单，消息没有发送到服务器。
        </p>
      </form>
    </div>
  </section>
</template>
