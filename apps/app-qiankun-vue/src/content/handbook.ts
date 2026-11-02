export interface Entry {
  id: string;
  title: string;
  group: string;
  summary: string;
  points: string[];
  code: string;
  takeaway: string;
  source: string;
  difficulty?: "基础" | "进阶" | "高级";
  followUp?: string;
}
export interface Chapter {
  id: string;
  label: string;
  caption: string;
  title: string;
  description: string;
  entries: Entry[];
}
const guide = "https://cn.vuejs.org/guide/";
function entry(
  id: string,
  title: string,
  group: string,
  summary: string,
  points: string[],
  code: string,
  takeaway: string,
  path: string
): Entry {
  return {
    id,
    title,
    group,
    summary,
    points,
    code,
    takeaway,
    source: guide + path,
  };
}
const foundations = [
  entry(
    "declarative",
    "声明式 UI 与单文件组件",
    "基础概念",
    "用模板描述状态对应的界面，把模板、逻辑和样式组织在 .vue 文件中。",
    [
      "setup 在每个组件实例创建时执行，响应式数据变化后更新相关视图。",
      "模板支持表达式，复杂派生逻辑放进 computed；不要在模板求值时发请求。",
    ],
    `<!-- Greeting.vue -->
<script setup>
import { ref, computed } from 'vue'
const name = ref('Vue')
const greeting = computed(() => '你好，' + (name.value.trim() || '朋友'))
</script>
<template>
  <input v-model="name" aria-label="名字" />
  <h2>{{ greeting }}</h2>
</template>`,
    "状态描述事实，模板呈现结果。",
    "essentials/template-syntax.html"
  ),
  entry(
    "directives",
    "v-if、v-show 与 v-for",
    "模板指令",
    "条件渲染决定内容是否显示，列表渲染将数据映射成具有稳定身份的节点。",
    [
      "v-if 会创建和销毁分支；v-show 保留节点，通过 display 切换。",
      "给列表提供稳定业务 key；避免在同一个元素上同时使用 v-if 和 v-for。",
    ],
    `const tasks = ref([{ id: 1, title: '学习 Vue', done: false }])
const pending = computed(() => tasks.value.filter(task => !task.done))

// 模板
<ul v-if="pending.length">
  <li v-for="task in pending" :key="task.id">{{ task.title }}</li>
</ul>
<p v-else>今天的任务都完成了</p>`,
    "频繁切换且创建成本高的内容可考虑 v-show。",
    "essentials/conditional.html"
  ),
  entry(
    "props",
    "Props 与单向数据流",
    "组件基础",
    "父组件传递输入，子组件发出事件表达意图，由数据所有者修改状态。",
    [
      "props 是浅只读的；不要通过修改嵌套对象绕开单向数据流。",
      "defineProps 和 defineEmits 是 script setup 的编译宏，不需要导入。",
    ],
    `<script setup lang="ts">
defineProps<{ title: string; liked: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>
<template>
  <button @click="emit('toggle')">{{ title }} · {{ liked ? '已赞' : '点赞' }}</button>
</template>`,
    "数据向下，事件向上，状态归属明确。",
    "components/props.html"
  ),
  entry(
    "events",
    "事件修饰符与表单绑定",
    "交互基础",
    "@click 绑定事件，v-model 将表单值与响应式状态连接起来。",
    [
      ".stop 控制传播，.prevent 控制默认行为，二者不互相替代。",
      "文本框可用 .trim、.lazy、.number；数字转换失败时仍可能得到原字符串。",
    ],
    `<script setup>
import { ref } from 'vue'
const title = ref('')
const result = ref('')
const save = () => { result.value = title.value }
</script>
<template>
  <form @submit.prevent="save">
    <input v-model.trim="title" required aria-label="标题" />
    <button>保存</button>
  </form>
  <p role="status">{{ result }}</p>
</template>`,
    "把常见 DOM 事件细节交给修饰符，让处理函数专注业务。",
    "essentials/event-handling.html"
  ),
];
const reactivity = [
  entry(
    "ref-reactive",
    "ref 与 reactive 的选择",
    "响应式数据",
    "ref 用 .value 包装任意值；reactive 为对象提供响应式代理。",
    [
      "对象放入普通 ref 后会被深层转换，模板中的顶层 ref 通常会自动解包。",
      "reactive 对象的基本类型属性直接解构后会失去响应式关联，可使用 toRefs。",
    ],
    `import { ref, reactive, toRefs } from 'vue'
const count = ref(0)
const state = reactive({ name: 'Vue', score: 0 })
const { score } = toRefs(state)
count.value++
score.value++ // 同时更新 state.score`,
    "需要整体替换的数据常用 ref；保持对象引用的结构可用 reactive。",
    "essentials/reactivity-fundamentals.html"
  ),
  entry(
    "computed",
    "computed：让派生状态只有一个来源",
    "派生状态",
    "把可从现有状态算出的数据放进计算属性，避免手动同步多个状态。",
    [
      "计算属性按响应式依赖缓存，读取时获得当前计算结果。",
      "getter 应无副作用，不发请求、不修改依赖；需要写入时提供明确的 setter。",
    ],
    `const price = ref(80)
const quantity = ref(2)
const total = computed(() => price.value * quantity.value)
quantity.value = 3
console.log(total.value) // 240`,
    "计算值用 computed，执行动作再考虑 watch。",
    "essentials/computed.html"
  ),
  entry(
    "watch",
    "watch 与 watchEffect 的边界",
    "副作用",
    "watch 显式声明观察源；watchEffect 在同步执行时自动收集读取的响应式依赖。",
    [
      "watch 默认惰性执行；watchEffect 创建时先执行一次。",
      "观察对象属性传 getter；异步 watchEffect 在第一个 await 之后读取的数据不自动成为依赖。",
    ],
    `const query = ref('')
watch(query, (value, previous) => {
  console.log('关键词变化', previous, value)
})
watchEffect(() => {
  console.log('当前关键词', query.value)
})`,
    "显式控制触发条件用 watch，简单依赖关联用 watchEffect。",
    "essentials/watchers.html"
  ),
  entry(
    "next-tick",
    "nextTick 与 DOM 更新时机",
    "更新调度",
    "修改响应式状态会立即改变数据，DOM 更新则被批量调度。",
    [
      "访问更新后的 DOM 时，先 await nextTick()。",
      "nextTick 等待 Vue 更新队列，不等同于网络完成或浏览器已经绘制下一帧。",
    ],
    `const count = ref(0)
const output = ref(null)
async function increment() {
  count.value++
  await nextTick()
  console.log(output.value.textContent)
}
// 模板：<p ref="output">{{ count }}</p>`,
    "区分数据变更、DOM 更新和浏览器绘制。",
    "essentials/reactivity-fundamentals.html"
  ),
];
const composition = [
  entry(
    "lifecycle",
    "生命周期与资源清理",
    "生命周期",
    "在挂载后连接 DOM 和外部资源，在卸载时解除订阅与计时器。",
    [
      "生命周期钩子在 setup 同步阶段注册；onMounted 不会在服务端渲染时运行。",
      "KeepAlive 缓存组件还有 activated / deactivated，离开时不一定触发卸载。",
    ],
    `import { ref, onMounted, onUnmounted } from 'vue'
const seconds = ref(0)
let timer
onMounted(() => {
  timer = setInterval(() => seconds.value++, 1000)
})
onUnmounted(() => clearInterval(timer))`,
    "资源由谁创建，就由谁负责释放。",
    "essentials/lifecycle.html"
  ),
  entry(
    "composables",
    "组合式函数：共享逻辑，不默认共享状态",
    "逻辑复用",
    "把相关状态和行为抽成 useXxx 函数，使用 ref 返回值保留解构后的响应式。",
    [
      "函数内部创建的 ref 在每次调用时独立存在。",
      "模块顶层状态会跨调用共享；SSR 场景需警惕跨请求污染。",
    ],
    `import { ref } from 'vue'
export function useToggle(initial = false) {
  const enabled = ref(initial)
  const toggle = () => { enabled.value = !enabled.value }
  return { enabled, toggle }
}
const first = useToggle()
const second = useToggle() // 独立状态`,
    "先明确状态生命周期，再决定它放在函数内部还是外部。",
    "reusability/composables.html"
  ),
  entry(
    "template-ref",
    "模板引用与 defineExpose",
    "实例交互",
    "模板 ref 在挂载后提供元素或组件实例，适用于聚焦和测量等命令式操作。",
    [
      "节点被 v-if 移除后，模板引用可能变回 null。",
      "script setup 组件默认不暴露内部绑定，可用 defineExpose 明确公开接口。",
    ],
    `<script setup>
import { ref } from 'vue'
const input = ref(null)
const focus = () => input.value?.focus()
defineExpose({ focus })
</script>
<template><input ref="input" aria-label="搜索" /></template>`,
    "优先 props / emits，只为必要的命令式操作暴露实例接口。",
    "essentials/template-refs.html"
  ),
  entry(
    "shallow",
    "shallowRef 与大型不可变数据",
    "高级 API",
    "shallowRef 只追踪 .value 的替换，内部对象不会自动深层响应化。",
    [
      "适合第三方实例、外部状态容器或按整体替换更新的大型数据。",
      "修改嵌套字段不会自动通知；可替换根引用，必要时明确使用 triggerRef。",
    ],
    `import { shallowRef } from 'vue'
const rows = shallowRef([{ id: 1, title: '初始内容' }])
rows.value = rows.value.map(row =>
  row.id === 1 ? { ...row, title: '新内容' } : row
)`,
    "浅层响应式是更新约定，不能只替换 API 却保留深层修改写法。",
    "best-practices/performance.html"
  ),
];
const components = [
  entry(
    "slots",
    "插槽与作用域插槽",
    "组件通信",
    "父级决定展示内容，子级通过 slot props 提供渲染所需的数据。",
    [
      "插槽内容通常在父组件作用域中求值，不能直接访问子组件私有变量。",
      "作用域插槽适合表格单元格、列表项等由调用方定制的 UI。",
    ],
    `<!-- 子组件 UserList.vue -->
<li v-for="user in users" :key="user.id">
  <slot :user="user">{{ user.name }}</slot>
</li>
<!-- 父组件 -->
<UserList v-slot="{ user }"><strong>{{ user.name }}</strong></UserList>`,
    "组件封装行为，插槽保留表现层的灵活性。",
    "components/slots.html"
  ),
  entry(
    "model",
    "defineModel 与组件 v-model",
    "组件通信",
    "Vue 3.4+ 可用 defineModel 声明双向绑定接口，底层仍是 prop 与更新事件。",
    [
      "默认对应 modelValue / update:modelValue；命名模型支持多个绑定。",
      "当父级未传值而子级设置默认值时，要注意父子初始状态不同步。",
    ],
    `<!-- TitleField.vue -->
<script setup>
const title = defineModel('title', { required: true })
</script>
<template><input v-model="title" aria-label="标题" /></template>
<!-- 父组件：<TitleField v-model:title="title" /> -->`,
    "v-model 是通信约定，不是任意修改父状态的捷径。",
    "components/v-model.html"
  ),
  entry(
    "provide",
    "provide / inject 与状态归属",
    "跨层通信",
    "祖先提供依赖，后代按 key 注入；多个提供者时使用最近的匹配祖先。",
    [
      "使用 Symbol 减少 key 冲突，并考虑未提供依赖时的处理。",
      "共享响应式状态时，可提供 readonly 数据和操作函数，将修改集中在提供方。",
    ],
    `// 共享模块
export const themeKey = Symbol('theme')
// 祖先 setup
const theme = ref('light')
provide(themeKey, {
  theme: readonly(theme),
  toggle: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' }
})
// 后代 setup
const themeContext = inject(themeKey)`,
    "注入解决跨层传递，仍要设计好数据修改权限。",
    "components/provide-inject.html"
  ),
  entry(
    "keep-alive",
    "KeepAlive 与缓存生命周期",
    "内置组件",
    "缓存动态组件实例，让切换后保留局部状态；用 max 控制缓存数量。",
    [
      "缓存命中时触发激活，离开触发停用；定时任务可在停用时暂停。",
      "include / exclude 按组件名匹配，动态 key 会影响实例身份与缓存条目。",
    ],
    `<KeepAlive :max="3">
  <component :is="currentTab" />
</KeepAlive>

// 被缓存的组件中
onActivated(() => startPolling())
onDeactivated(() => stopPolling())
onUnmounted(() => stopPolling())`,
    "缓存延长组件寿命，也延长其占用资源的时间。",
    "built-ins/keep-alive.html"
  ),
];
const performance = [
  entry(
    "rendering",
    "编译优化与虚拟 DOM",
    "渲染原理",
    "Vue 编译模板时识别静态结构和动态绑定，帮助运行时减少不必要的工作。",
    [
      "静态内容可被缓存；patch flags 提供动态内容的信息。",
      "block tree 追踪动态后代，仍需合理的数据结构和组件边界配合。",
    ],
    `<template>
  <section>
    <h2>固定标题</h2>
    <p>{{ message }}</p>
  </section>
</template>
<!-- message 变化时，编译信息帮助定位动态内容。 -->`,
    "理解编译提示，不把“虚拟 DOM”当成所有性能问题的答案。",
    "extras/rendering-mechanism.html"
  ),
  entry(
    "lazy",
    "异步组件与路由懒加载",
    "加载优化",
    "按使用时机拆分代码，降低首屏需要解析和执行的 JavaScript。",
    [
      "defineAsyncComponent 可配置加载状态、错误组件和超时。",
      "Vue Router 的路由组件直接使用返回 import 的函数，不用再包一层异步组件。",
    ],
    `import { defineAsyncComponent } from 'vue'
const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))

// 路由定义
const routes = [
  { path: '/reports', component: () => import('./ReportsPage.vue') }
]`,
    "拆分代码也要考虑网络瀑布与加载失败后的反馈。",
    "components/async.html"
  ),
  entry(
    "stable-props",
    "稳定 props 与长列表",
    "更新优化",
    "让子组件只接收自身需要的变化，减少与当前行无关的更新。",
    [
      "向每一行传 active 布尔值，而不是让所有行接收不断变化的 activeId。",
      "大量 DOM 节点优先考虑虚拟列表；先测量，再选择 v-memo 或浅层响应式。",
    ],
    `<ListItem
  v-for="item in items"
  :key="item.id"
  :item="item"
  :active="item.id === activeId"
/>`,
    "先减少无意义的数据变化，再减少需要渲染的节点数量。",
    "best-practices/performance.html"
  ),
  entry(
    "error-handling",
    "错误处理与微前端清理",
    "可靠性",
    "功能区为失败提供可恢复界面，应用卸载时清理自己创建的资源。",
    [
      "onErrorCaptured 捕获后代的部分运行期错误，返回 false 会阻止继续传播。",
      "事件中的请求仍应处理失败；qiankun unmount 要销毁 app、路由监听和外部订阅。",
    ],
    `const failed = ref(false)
onErrorCaptured(() => {
  failed.value = true
  return false
})
// 模板使用 v-if 在失败时替换出错的子树
// 微前端卸载
app.unmount()
router.options.history.destroy()`,
    "错误状态应能恢复，资源清理应对应实际实例。",
    "scaling-up/ssr.html"
  ),
];

function interview(
  base: Entry,
  difficulty: Entry["difficulty"],
  followUp: string
): Entry {
  return { ...base, difficulty, followUp };
}
const interviews: Entry[] = [
  interview(
    entry(
      "i-proxy",
      "Vue 3 的响应式系统如何追踪和触发更新？",
      "响应式原理",
      "核心是读取时收集依赖、写入时通知相关订阅者，再由调度器安排更新。",
      [
        "reactive 通过 Proxy 拦截对象操作；ref 通过 value 的访问器连接依赖系统。",
        "依赖按目标和属性关联，不会在任意属性变化时重新更新整棵应用。",
        "条件分支改变时需要清理陈旧依赖，避免已不使用的属性继续触发执行。",
      ],
      `const state = reactive({ enabled: true, a: 1, b: 2 })
watchEffect(() => {
  console.log(state.enabled ? state.a : state.b)
})
// enabled 切为 false 后，后续只改 a 不应触发该 effect。`,
      "回答时串起 track、trigger、依赖清理和更新调度。",
      "extras/reactivity-in-depth.html"
    ),
    "进阶",
    "为什么直接修改原始对象而不是代理对象，可能无法触发更新？"
  ),
  interview(
    entry(
      "i-destructure",
      "解构 reactive 后，为什么界面不更新？",
      "响应式原理",
      "解构基本类型只取得当时的值，之后不再经过原代理属性的读取。",
      [
        "使用 toRef / toRefs 建立到原属性的引用，或通过 getter 保留读取。",
        "如果解构得到的是响应式对象，修改该对象内部属性仍可能响应；不能一概说所有解构都失效。",
        "Vue 3.5+ script setup 内的 defineProps 解构有编译器支持，与普通 reactive 解构不同。",
      ],
      `const state = reactive({ count: 0 })
const { count } = state
const countRef = toRef(state, 'count')
state.count++
console.log(count, countRef.value) // 0, 1`,
      "区分 JavaScript 赋值、对象引用与编译器转换。",
      "essentials/reactivity-fundamentals.html"
    ),
    "进阶",
    "将解构的 prop 交给 watch 时，为什么应传 getter？"
  ),
  interview(
    entry(
      "i-computed",
      "computed、watch 和方法如何选择？",
      "响应式原理",
      "computed 表达派生值，watch 协调副作用，方法用于按调用时机执行的逻辑。",
      [
        "computed 按响应式依赖缓存；方法在每次被调用时执行。",
        "watch 用于请求、持久化等动作，不要用它维护可直接算出的重复状态。",
        "非响应式 Date.now() 不会主动让 computed 定时更新。",
      ],
      `const first = ref('小')
const last = ref('林')
const fullName = computed(() => first.value + last.value)
watch(fullName, value => console.log('名字变了', value))`,
      "从“得到一个值”还是“做一件事”开始选择。",
      "essentials/computed.html"
    ),
    "基础",
    "computed getter 中改写它自己的依赖会带来什么问题？"
  ),
  interview(
    entry(
      "i-deep",
      "deep watch 中，新旧值为什么相等？",
      "响应式原理",
      "对象内部发生修改时，深度侦听不会自动保存修改前的对象快照。",
      [
        "未替换对象引用时，回调中的 newValue 与 oldValue 可以指向同一个对象。",
        "需要对比字段时监听具体 getter；确实需要历史快照时在业务边界复制。",
        "深度遍历有成本；Vue 3.5+ 可用数字 deep 限定遍历深度。",
      ],
      `const state = reactive({ user: { name: '林' } })
watch(() => state.user.name, (next, previous) => {
  console.log(previous, '→', next)
})
state.user.name = '陈'`,
      "deep 表示追踪嵌套变化，不表示自动生成历史版本。",
      "essentials/watchers.html"
    ),
    "进阶",
    "如何在大型表单中做变更比较，避免每次遍历整个对象？"
  ),
  interview(
    entry(
      "i-tick",
      "连续更新三次状态，DOM 何时变化？",
      "更新机制",
      "状态值同步累加，组件的 DOM 更新通常在同一批次合并。",
      [
        "同步读取 count.value 可以得到 3，DOM 此时可能仍是旧值。",
        "await nextTick() 后读取本轮更新后的 DOM；不要把 setTimeout 当成准确的更新契约。",
        "flush: 'post' 的 watcher 在所属组件 DOM 更新后执行，适用于依赖更新后 DOM 的副作用。",
      ],
      `async function addThree() {
  count.value++
  count.value++
  count.value++
  console.log(count.value)
  await nextTick()
  console.log(output.value?.textContent)
}`,
      "将状态同步变化与视图异步批量更新分开说明。",
      "essentials/reactivity-fundamentals.html"
    ),
    "进阶",
    "nextTick 能否保证 CSS 动画已经播放完毕？"
  ),
  interview(
    entry(
      "i-key",
      "列表为什么不用索引作为 key？",
      "组件设计",
      "key 参与节点身份匹配。索引在重排后对应了不同业务项，可能复用错误的局部状态。",
      [
        "可编辑列表、动画和有内部状态的子组件尤其需要稳定业务 ID。",
        "随机 key 每次变化会导致重新创建，丢失状态且增加开销。",
        "纯静态列表不必绝对禁止索引，但要说明数据不会重排这一前提。",
      ],
      `<TaskEditor
  v-for="task in tasks"
  :key="task.id"
  :task="task"
/>
<!-- 删除首行后，其他行仍对应自己的草稿状态。 -->`,
      "key 表达身份，不只是消除控制台提示。",
      "essentials/list.html"
    ),
    "基础",
    "何时可以故意改变 key 来重置整个子树？"
  ),
  interview(
    entry(
      "i-if-show",
      "v-if 与 v-show，切换标签页时选哪个？",
      "组件设计",
      "选择取决于初次渲染成本、切换频率和是否需要保留状态。",
      [
        "v-if 为 false 时不创建分支，切换会触发销毁和重建。",
        "v-show 初次就渲染内容，只切换 CSS display；不支持在 template 上使用。",
        "复杂标签页需要缓存组件实例时，可结合动态组件与 KeepAlive。",
      ],
      `<ExpensivePanel v-if="opened" />
<QuickHint v-show="hovered" />`,
      "不要只背“频繁切换用 v-show”，还要考虑隐藏内容的资源占用。",
      "essentials/conditional.html"
    ),
    "基础",
    "v-show 隐藏一个组件时，它的定时器会自动停止吗？"
  ),
  interview(
    entry(
      "i-model",
      "手写一个支持 v-model 的组件，需要什么？",
      "组件设计",
      "声明值的 prop 和对应更新事件，让父组件掌握真实数据。",
      [
        "默认协议是 modelValue 与 update:modelValue；Vue 3.4+ 可用 defineModel 简化。",
        "命名绑定如 v-model:title 对应 title 与 update:title。",
        "避免同时维护一份不必要的内部副本，造成父子状态分叉。",
      ],
      `<script setup>
defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <input :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)" />
</template>`,
      "双向绑定的语法背后，仍是明确的数据流。",
      "components/v-model.html"
    ),
    "进阶",
    "如何支持 trim 修饰符或同一组件的多个 v-model？"
  ),
  interview(
    entry(
      "i-slots",
      "作用域插槽的数据究竟来自哪里？",
      "组件设计",
      "布局由父组件提供，数据由子组件通过插槽参数传回父级模板。",
      [
        "普通插槽访问父作用域；作用域插槽显式解构子级提供的数据。",
        "插槽可理解为子级调用的渲染函数，函数体来自父级。",
      ],
      `<!-- 子组件 -->
<slot name="item" :row="row" :index="index" />
<!-- 父组件 -->
<DataList>
  <template #item="{ row, index }">{{ index + 1 }}. {{ row.name }}</template>
</DataList>`,
      "把内容归属与数据来源分开讲清楚。",
      "components/slots.html"
    ),
    "进阶",
    "如何设计一个既有默认 UI，又允许自定义单元格的表格？"
  ),
  interview(
    entry(
      "i-state",
      "Props、provide/inject、Pinia 如何分工？",
      "场景设计",
      "先判断状态属于局部组件树还是跨页面业务，再选择通信范围。",
      [
        "父子交互优先 props / emits；树内依赖可用 provide / inject。",
        "跨页面、有统一业务动作的状态可放 Pinia；弹窗是否打开等局部状态通常保留在组件。",
        "Pinia store 解构响应式状态使用 storeToRefs，动作可直接解构。",
      ],
      `// Pinia 项目中
const store = useCartStore()
const { items, total } = storeToRefs(store)
const { addItem } = store
// 当前页面的弹窗仍保持局部状态
const dialogOpen = ref(false)`,
      "状态管理工具不能代替清晰的数据所有权。",
      "scaling-up/state-management.html"
    ),
    "进阶",
    "SSR 下为什么不能把所有用户共用的可变状态放在模块顶层？"
  ),
  interview(
    entry(
      "i-race",
      "搜索请求乱序返回，如何防止旧结果覆盖？",
      "场景设计",
      "每次关键词变化都使旧请求失效，结合取消请求与结果有效性校验。",
      [
        "侦听回调第三个参数 onCleanup 可清理上一次任务；在发起异步操作前注册。",
        "AbortController 取消 fetch，失效标记同时保护成功、失败和 loading 状态。",
        "防抖减少请求数量，但不能单独解决已经发出的请求乱序。",
      ],
      `watch(query, async (value, _, onCleanup) => {
  const controller = new AbortController()
  let active = true
  onCleanup(() => { active = false; controller.abort() })
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('/api/search?q=' + encodeURIComponent(value), {
      signal: controller.signal
    })
    if (!response.ok) throw new Error('请求失败')
    const data = await response.json()
    if (active) results.value = data
  } catch (cause) {
    if (active) error.value = String(cause)
  } finally {
    if (active) loading.value = false
  }
})`,
      "过期保护覆盖整个请求状态，而不只是最后的数据赋值。",
      "essentials/watchers.html"
    ),
    "高级",
    "Vue 3.5 的 onWatcherCleanup 为什么必须在 await 前调用？"
  ),
  interview(
    entry(
      "i-cache",
      "KeepAlive 页面离开后仍在轮询，如何排查？",
      "故障排查",
      "缓存组件离开时是停用，不一定卸载，只在 onUnmounted 清理不够。",
      [
        "onActivated 启动任务，onDeactivated 暂停，onUnmounted 最终兜底释放。",
        "启动函数保持幂等，防止首次挂载与激活都创建计时器。",
        "正在进行的请求也要取消或忽略，避免停用后回写。",
      ],
      `let timer
function stop() { clearInterval(timer); timer = undefined }
function start() {
  stop()
  timer = setInterval(refresh, 5000)
}
onActivated(start)
onDeactivated(stop)
onUnmounted(stop)`,
      "可见性、激活状态与实例生命期是不同概念。",
      "built-ins/keep-alive.html"
    ),
    "高级",
    "max 淘汰缓存时，哪些资源还需要最终释放？"
  ),
  interview(
    entry(
      "i-performance",
      "上万条列表卡顿，你会按什么顺序优化？",
      "场景设计",
      "先定位瓶颈属于网络、计算、DOM 数量还是更新范围，再验证优化效果。",
      [
        "DOM 数量大时优先分页或虚拟列表；昂贵筛选可缓存或移到 Worker。",
        "稳定 props，避免每一行收到无关变化；大块不可变数据可考虑 shallowRef。",
        "v-memo 不是默认开关，依赖遗漏可能跳过必要更新。",
      ],
      `const rows = shallowRef([])
const selectedId = ref(null)
// 行只接收自己的 selected 布尔值
<Row v-for="row in visibleRows" :key="row.id"
  :row="row" :selected="row.id === selectedId" />`,
      "把优化手段与测到的瓶颈一一对应。",
      "best-practices/performance.html"
    ),
    "高级",
    "为什么减少响应式追踪成本仍不能解决十万个 DOM 节点的问题？"
  ),
  interview(
    entry(
      "i-route",
      "路由参数变了，为什么 mounted 没再次执行？",
      "故障排查",
      "相同路由组件可能复用同一个实例，只是参数发生了变化。",
      [
        "监听具体参数或使用 onBeforeRouteUpdate，不要只在挂载时加载数据。",
        "处理快速参数变化导致的请求竞态；需要重置实例时再考虑 key。",
        "避免监听整个 route 对象导致无关查询参数触发请求。",
      ],
      `const route = useRoute()
watch(() => route.params.id, (id, _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  // loadUser 内处理取消、失败与过期回写
  void loadUser(String(id), controller.signal)
}, { immediate: true })`,
      "路由变化与组件重新创建不是同一件事。",
      "scaling-up/routing.html"
    ),
    "进阶",
    "当详情页有未保存编辑时，如何在离开前进行确认？"
  ),
  interview(
    entry(
      "i-ssr",
      "SSR hydration mismatch 的常见原因是什么？",
      "故障排查",
      "服务端 HTML 与客户端首次渲染结果不一致，水合无法完全复用原结构。",
      [
        "排查随机数、时区、当前时间、浏览器专属 API 和无效 HTML 嵌套。",
        "共享确定性的初始数据；只依赖浏览器的信息可在挂载后更新。",
        "不要直接访问模块级 window；多用户状态应为每个请求独立创建。",
      ],
      `const mounted = ref(false)
onMounted(() => { mounted.value = true })
// 服务端与客户端首次渲染均展示占位
<BrowserOnlyChart v-if="mounted" />
<p v-else>图表加载中…</p>`,
      "先保证首次输出一致，再做客户端增强。",
      "scaling-up/ssr.html"
    ),
    "高级",
    "如何让服务器和客户端复用同一份初始数据？"
  ),
  interview(
    entry(
      "i-teleport",
      "Teleport 到 body，为什么在微前端中样式异常？",
      "场景设计",
      "Teleport 改变实际 DOM 位置；若样式依赖应用根节点，移到 body 后就不再匹配。",
      [
        "逻辑组件关系仍保留，props、事件和注入按原组件树工作。",
        "为应用建立专用弹层容器，放在样式作用域内，并明确卸载策略。",
        "目标节点需要在挂载时存在；Vue 3.5 defer 可以延后到同一挂载周期解析。",
      ],
      `<!-- Shell：先创建目标 -->
<div id="vue-dialogs"></div>
<!-- 后续子组件 -->
<Teleport to="#vue-dialogs">
  <div role="dialog" aria-modal="true" aria-label="详情">…</div>
</Teleport>`,
      "弹层还需要焦点管理、Esc 关闭与滚动锁定。",
      "built-ins/teleport.html"
    ),
    "高级",
    "同时挂载多个应用时，如何避免弹层目标 ID 冲突？"
  ),
  interview(
    entry(
      "i-composable",
      "组合式函数会共享状态吗？如何避免资源泄漏？",
      "场景设计",
      "是否共享取决于状态创建的位置；副作用要与调用方的作用域一起释放。",
      [
        "函数内部 ref 每次调用独立；模块顶层 ref 会被同模块调用者共享。",
        "组件 setup 同步创建的侦听通常随组件停止；异步创建的侦听需自己保存并调用停止函数。",
        "可复用函数中使用 onScopeDispose，让清理归属于 effect scope。",
      ],
      `function useWindowWidth() {
  const width = ref(0)
  const update = () => { width.value = window.innerWidth }
  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onScopeDispose(() => window.removeEventListener('resize', update))
  return { width }
}`,
      "共享逻辑、共享状态和共享副作用，需要分别设计。",
      "reusability/composables.html"
    ),
    "进阶",
    "该函数如果用于 SSR，哪些代码应只在客户端运行？"
  ),
  interview(
    entry(
      "i-micro",
      "Vue 子应用接入 qiankun，挂载与卸载要处理什么？",
      "场景设计",
      "每次挂载创建应用实例与路由，卸载时释放这次实例的全部资源。",
      [
        "挂载节点应从宿主传入的 container 内查找，防止跨应用冲突。",
        "路由使用宿主传入的 basePath，异步资源使用子应用 publicPath。",
        "销毁 Vue 实例、history 监听、手动事件和计时器；样式限定到应用根节点。",
      ],
      `const app = createApp(App)
const router = createAppRouter(props.basePath)
app.use(router)
await router.isReady()
app.mount(props.container.querySelector('#app-qiankun-vue-root'))
// unmount
app.unmount()
router.options.history.destroy()`,
      "独立运行、嵌入运行、深链与重复挂载都需要验证。",
      "essentials/application.html"
    ),
    "高级",
    "为什么应用使用绝对路径 /products，在宿主中仍能获得正确前缀？"
  ),
];
// 生态相关条目使用对应项目的官方资料。
interviews.find((item) => item.id === "i-state")!.source =
  "https://pinia.vuejs.org/core-concepts/";
interviews.find((item) => item.id === "i-route")!.source =
  "https://router.vuejs.org/guide/essentials/dynamic-matching.html";
interviews.find((item) => item.id === "i-micro")!.source =
  "https://qiankun.umijs.org/guide/getting-started";
performance.find((item) => item.id === "error-handling")!.source =
  "https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured";

export const chapters: Chapter[] = [
  {
    id: "foundations",
    label: "基础与模板",
    caption: "从声明式 UI 开始",
    title: "从一个组件，理解 Vue 的思考方式。",
    description: "模板、指令、数据流与事件，建立扎实的组件基础。",
    entries: foundations,
  },
  {
    id: "reactivity",
    label: "响应式原理",
    caption: "看见状态如何驱动界面",
    title: "让每一次变化，都有迹可循。",
    description: "理解 ref、reactive、计算属性、侦听与更新时机。",
    entries: reactivity,
  },
  {
    id: "composition",
    label: "Composition API",
    caption: "组合逻辑，明确边界",
    title: "把相关的逻辑，放在一起。",
    description: "生命周期、组合式函数与高级响应式 API，写出可维护的逻辑。",
    entries: composition,
  },
  {
    id: "components",
    label: "组件与通信",
    caption: "连接组件，也保持独立",
    title: "好的组件，从清晰的接口开始。",
    description: "通过插槽、v-model、依赖注入与缓存组织组件之间的关系。",
    entries: components,
  },
  {
    id: "performance",
    label: "渲染与实践",
    caption: "从原理走向工程",
    title: "理解更新，优化才有方向。",
    description: "从编译优化到按需加载，兼顾性能、可靠性与应用边界。",
    entries: performance,
  },
  {
    id: "interview",
    label: "面试题与答案",
    caption: "说清原理，也解决问题",
    title: "不仅知道答案，还能说明为什么。",
    description:
      "先独立作答，再展开参考答案、代码与延伸追问。覆盖基础、进阶和真实工程场景。",
    entries: interviews,
  },
];
export const entryCount = chapters.reduce(
  (total, chapter) => total + chapter.entries.length,
  0
);
export const interviewCount = interviews.length;
export function searchEntries(
  entries: Entry[],
  query: string,
  group = "全部",
  difficulty = "全部"
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((item) => {
    if (group !== "全部" && item.group !== group) return false;
    if (difficulty !== "全部" && item.difficulty !== difficulty) return false;
    const text = [
      item.title,
      item.group,
      item.summary,
      ...item.points,
      item.code,
      item.takeaway,
      item.followUp ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
