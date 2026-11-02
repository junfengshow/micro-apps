<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  chapters,
  entryCount,
  interviewCount,
  searchEntries,
} from "../content/handbook";
import VueMark from "../components/VueMark.vue";
import EntryBody from "../components/EntryBody.vue";
import LiveDemo from "../components/LiveDemo.vue";
const route = useRoute();
const router = useRouter();
const chapter = computed(
  () => chapters.find((item) => item.id === route.query.chapter) ?? chapters[0]
);
const query = ref("");
const group = ref("全部");
const difficulty = ref("全部");
const expanded = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const groups = computed(() => [
  "全部",
  ...new Set(chapter.value.entries.map((item) => item.group)),
]);
const entries = computed(() =>
  searchEntries(
    chapter.value.entries,
    query.value,
    group.value,
    difficulty.value
  )
);
const isInterview = computed(() => chapter.value.id === "interview");
function resetFilters() {
  query.value = "";
  group.value = "全部";
  difficulty.value = "全部";
}
watch(chapter, () => {
  resetFilters();
  expanded.value = false;
});
function selectChapter(id: string) {
  void router.replace({ path: "/vue", query: { chapter: id } });
}
</script>
<template>
  <div class="handbook">
    <a class="skip-link" href="#handbook-content">跳转到正文</a>
    <aside class="handbook-sidebar">
      <RouterLink to="/" class="brand handbook-brand"
        ><VueMark /><span
          >Vue<span class="brand-light"> Handbook</span></span
        ></RouterLink
      >
      <p class="sidebar-caption">一份可以动手的 Vue 知识手册</p>
      <p class="eyebrow sidebar-label">LEARNING PATH / 学习目录</p>
      <nav class="chapter-nav" aria-label="知识分类">
        <button
          v-for="(item, index) in chapters"
          :key="item.id"
          :aria-pressed="chapter.id === item.id"
          @click="selectChapter(item.id)"
        >
          <span class="chapter-index">0{{ index + 1 }}</span
          ><span
            ><strong>{{ item.label }}</strong
            ><small>{{ item.caption }}</small></span
          ><span class="chapter-count">{{ item.entries.length }}</span>
        </button>
      </nav>
      <div class="sidebar-note">
        <span>✳</span>
        <h2>理解，比记住更重要。</h2>
        <p>读一段解释，改一个例子，<br />再用自己的话说清楚。</p>
        <a
          href="https://cn.vuejs.org/guide/introduction.html"
          target="_blank"
          rel="noreferrer"
          >Vue 官方指南 ↗</a
        >
      </div>
      <RouterLink class="back-studio" to="/">← 返回 Vue Studio</RouterLink>
    </aside>
    <main id="handbook-content" class="handbook-main" tabindex="-1">
      <header class="handbook-topbar">
        <span>学习 / {{ chapter.label }}</span
        ><span class="version-badge"><i /> Vue 3 · Composition API</span>
      </header>
      <section class="handbook-hero">
        <div>
          <p class="eyebrow">THE PROGRESSIVE LEARNING JOURNEY</p>
          <h1>
            循序渐进，<br /><span class="gradient-text">把 Vue 学明白。</span>
          </h1>
          <p>
            从状态到界面，从原理到实践。<br />让零散的知识，长成自己的技术体系。
          </p>
          <div class="handbook-stats">
            <span
              ><strong>{{ chapters.length }}</strong> 学习章节</span
            ><span
              ><strong>{{ entryCount }}</strong> 知识条目</span
            ><span
              ><strong>{{ interviewCount }}</strong> 精选面试题</span
            >
          </div>
        </div>
        <div class="handbook-art" aria-hidden="true">
          <div />
          <VueMark /><span>REACTIVE BY NATURE.</span>
        </div>
      </section>
      <section class="chapter-section" aria-labelledby="chapter-title">
        <div class="chapter-heading">
          <div>
            <p class="eyebrow">
              CHAPTER 0{{ chapters.indexOf(chapter) + 1 }} / {{ chapter.label }}
            </p>
            <h2 id="chapter-title">{{ chapter.title }}</h2>
            <p>{{ chapter.description }}</p>
          </div>
          <span class="chapter-big-number"
            >0{{ chapters.indexOf(chapter) + 1 }}</span
          >
        </div>
        <div class="handbook-tools">
          <label class="search-box"
            ><span aria-hidden="true">⌕</span
            ><input
              ref="searchInput"
              v-model="query"
              type="search"
              :placeholder="
                isInterview
                  ? '搜索面试题、答案或代码…'
                  : '搜索当前章节的知识与代码…'
              "
              aria-label="搜索当前章节"
              @keydown.esc="query = ''"
            /><kbd>ESC</kbd></label
          ><span aria-live="polite"
            >{{ entries.length }} / {{ chapter.entries.length }} 条</span
          ><button
            v-if="isInterview"
            class="quiet-button"
            :aria-pressed="expanded"
            @click="expanded = !expanded"
          >
            {{ expanded ? "收起全部答案" : "展开全部答案" }}
          </button>
        </div>
        <div class="filters" aria-label="主题筛选">
          <button
            v-for="item in groups"
            :key="item"
            :aria-pressed="group === item"
            @click="group = item"
          >
            {{ item }}
          </button>
        </div>
        <div v-if="isInterview" class="difficulty-filter">
          <label
            >难度<select v-model="difficulty">
              <option>全部</option>
              <option>基础</option>
              <option>进阶</option>
              <option>高级</option>
            </select></label
          ><span>先想一想，再展开参考答案。</span>
        </div>
        <LiveDemo v-if="!isInterview" :key="chapter.id" :chapter="chapter.id" />
        <div class="reading-layout">
          <div class="entries">
            <template v-for="(item, index) in entries" :key="item.id">
              <details
                v-if="isInterview"
                :id="item.id"
                :key="`${item.id}-${expanded}`"
                :open="expanded"
                class="knowledge-entry interview-entry"
              >
                <summary>
                  <span class="entry-number">{{
                    String(index + 1).padStart(2, "0")
                  }}</span
                  ><span class="entry-title"
                    >{{ item.title
                    }}<small
                      >{{ item.group }} · {{ item.difficulty }}</small
                    ></span
                  ><span class="entry-plus" aria-hidden="true">+</span>
                </summary>
                <EntryBody :entry="item" />
              </details>
              <article v-else :id="item.id" class="knowledge-entry">
                <header>
                  <span class="entry-number">{{
                    String(index + 1).padStart(2, "0")
                  }}</span>
                  <h3>{{ item.title }}</h3>
                  <span class="badge">{{ item.group }}</span>
                </header>
                <EntryBody :entry="item" />
              </article>
            </template>
            <div v-if="!entries.length" class="empty-state">
              <span>⌕</span>
              <h3>还没找到匹配的内容</h3>
              <p>试试更短的关键词，或清除筛选条件。</p>
              <button
                class="button button-small"
                @click="
                  resetFilters();
                  searchInput?.focus();
                "
              >
                清除筛选
              </button>
            </div>
          </div>
          <aside class="chapter-outline">
            <p class="eyebrow">ON THIS PAGE</p>
            <nav aria-label="当前结果目录">
              <a v-for="item in entries" :key="item.id" :href="`#${item.id}`">{{
                item.title
              }}</a>
            </nav>
            <p>
              示例中省略的 API 需从 Vue 导入；Pinia 和 Router
              示例需在对应项目环境使用。
            </p>
          </aside>
        </div>
      </section>
      <footer class="handbook-footer">
        <span>Vue Handbook · 理解原理，保持好奇。</span
        ><RouterLink to="/">返回工作室 ↗</RouterLink>
      </footer>
    </main>
  </div>
</template>
