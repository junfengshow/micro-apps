<script setup lang="ts">
import type { Entry } from "../content/handbook";
import CodeExample from "./CodeExample.vue";
defineProps<{ entry: Entry }>();
</script>
<template>
  <div class="entry-body">
    <div>
      <p class="entry-summary">{{ entry.summary }}</p>
      <ul>
        <li v-for="point in entry.points" :key="point">{{ point }}</li>
      </ul>
      <div class="takeaway">
        <span>记住这一点</span>
        <p>{{ entry.takeaway }}</p>
      </div>
      <p v-if="entry.followUp" class="follow-up">
        <strong>继续追问</strong>{{ entry.followUp }}
      </p>
      <a
        class="source-link"
        :href="entry.source"
        target="_blank"
        rel="noreferrer"
        >阅读官方文档 ↗</a
      >
    </div>
    <CodeExample :code="entry.code" />
  </div>
</template>
