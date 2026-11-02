<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps<{ code: string }>();
const status = ref("");
watch(
  () => props.code,
  () => {
    status.value = "";
  }
);
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
    status.value = "代码已复制";
  } catch {
    status.value = "无法访问剪贴板，请选中代码手动复制。";
  }
}
</script>
<template>
  <div class="code-example">
    <div class="code-bar">
      <span><i /><i /><i /> EXAMPLE / VUE</span
      ><button type="button" @click="copy">复制代码</button>
    </div>
    <pre tabindex="0" aria-label="Vue 代码示例"><code>{{ code }}</code></pre>
    <p v-if="status" role="status" class="copy-status">{{ status }}</p>
  </div>
</template>
