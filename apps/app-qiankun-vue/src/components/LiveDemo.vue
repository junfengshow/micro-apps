<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
defineProps<{ chapter: string }>();
const count = ref(0);
const doubled = computed(() => count.value * 2);
const output = ref<HTMLElement | null>(null);
const updateLog = ref("点击按钮，对比同步数据和更新后的 DOM。");
async function addThree() {
  count.value += 3;
  const before = output.value?.textContent;
  await nextTick();
  updateLog.value = `同步阶段 DOM：${before} → nextTick 后 DOM：${output.value?.textContent}`;
}
const name = ref("Vue");
const greeting = computed(() => `你好，${name.value.trim() || "朋友"}！`);
const stop = ref(true);
const events = ref<string[]>([]);
function record(message: string) {
  events.value = [...events.value.slice(-5), message];
}
function clickChild(event: MouseEvent) {
  if (stop.value) event.stopPropagation();
  record(stop.value ? "按钮（停止冒泡）" : "按钮");
}
</script>
<template>
  <section class="live-demo" aria-label="可交互 Vue 示例">
    <div>
      <p class="eyebrow">TRY IT YOURSELF</p>
      <h3>
        {{
          chapter === "foundations"
            ? "输入变化，界面自然响应。"
            : chapter === "components"
              ? "亲手观察事件传播。"
              : "状态改变之后，发生了什么？"
        }}
      </h3>
      <p>直接操作，观察真实 Vue 组件的响应。</p>
    </div>
    <div v-if="chapter === 'foundations'" class="demo-controls">
      <label>你的名字<input v-model="name" placeholder="试着输入名字" /></label
      ><strong class="demo-greeting">{{ greeting }}</strong
      ><button class="quiet-button" @click="name = 'Vue'">重置</button>
    </div>
    <div v-else-if="chapter === 'components'" class="demo-controls">
      <label class="checkbox-label"
        ><input v-model="stop" type="checkbox" /> 阻止按钮事件冒泡</label
      >
      <div
        class="event-parent"
        @click.capture="record('父级捕获')"
        @click="record('父级冒泡')"
      >
        <button class="button button-small" @click="clickChild">
          点击子按钮
        </button>
      </div>
      <p aria-live="polite">{{ events.join(" → ") || "等待点击…" }}</p>
      <button class="quiet-button" @click="events = []">清空记录</button>
    </div>
    <div v-else class="demo-controls">
      <div class="demo-values">
        <span
          >ref <strong ref="output">{{ count }}</strong></span
        ><span
          >computed × 2 <strong>{{ doubled }}</strong></span
        >
      </div>
      <div class="actions">
        <button class="button button-small" @click="addThree">计数 +3</button
        ><button
          class="quiet-button"
          @click="
            count = 0;
            updateLog = '已重置';
          "
        >
          重置
        </button>
      </div>
      <p role="status">{{ updateLog }}</p>
    </div>
  </section>
</template>
