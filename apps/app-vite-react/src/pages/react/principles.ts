import PrincipleUpdateQueueDemo from "./demos/principleUpdateQueueDemo";
import principleUpdateQueueDemoCode from "./demos/principleUpdateQueueDemo.tsx?raw";
import PrincipleSetstateTimingDemo from "./demos/principleSetstateTimingDemo";
import principleSetstateTimingDemoCode from "./demos/principleSetstateTimingDemo.tsx?raw";
import PrincipleAutomaticBatchingDemo from "./demos/principleAutomaticBatchingDemo";
import principleAutomaticBatchingDemoCode from "./demos/principleAutomaticBatchingDemo.tsx?raw";
import PrincipleFlushSyncDemo from "./demos/principleFlushSyncDemo";
import principleFlushSyncDemoCode from "./demos/principleFlushSyncDemo.tsx?raw";
import PrincipleLanesDemo from "./demos/principleLanesDemo";
import principleLanesDemoCode from "./demos/principleLanesDemo.tsx?raw";
import PrincipleHookStorageDemo from "./demos/principleHookStorageDemo";
import principleHookStorageDemoCode from "./demos/principleHookStorageDemo.tsx?raw";
import PrincipleEffectPhasesDemo from "./demos/principleEffectPhasesDemo";
import principleEffectPhasesDemoCode from "./demos/principleEffectPhasesDemo.tsx?raw";
import type { KnowledgeEntry } from "./types";

export const principleEntries: KnowledgeEntry[] = [
  {
    id: "principle-reconciliation",
    title: "Diff 算法：通过类型、位置与 key 判断复用",
    group: "协调与 Diff",
    summary:
      "Reconciliation（协调）在渲染阶段比较新元素与已有 Fiber，决定复用、插入和删除；DOM 修改留到提交阶段。React 用同层比较的启发式规则减少搜索，不求任意两棵树的最优编辑路径。",
    points: [
      "同一父级下，先通过 key（未提供时依赖位置）寻找候选，再检查元素类型；类型不同，即使 key 相同，也会替换对应子树并重置状态。",
      "类型与身份匹配时，复用对应的 Fiber 状态，继续处理新 props 和子节点；DOM 元素只应用需要的属性和内容变化。复用不代表组件函数不执行。",
      "key 只在兄弟节点间有效，不会让组件跨父级迁移时自动保留状态；组件身份还受到祖先结构变化的影响。",
      "常说的 O(n) 是基于类型与稳定 key 假设的协调思路，不代表每次更新的总成本都是 O(n)，也不代表一定产生最少的 DOM 移动。",
    ],
    code: `// 三组前后对比：均假设位于同一父节点的同一子位置。
// 1. 类型与 key 相同：保留 Editor 的局部状态，更新 props。
<Editor key="alice" theme="light" />
// → <Editor key="alice" theme="dark" />

// 2. key 相同但组件类型不同：卸载 Editor，挂载 Preview。
<Editor key="alice" />
// → <Preview key="alice" />

// 3. 类型相同但 key 不同：视为另一个编辑会话，重置状态。
<Editor key="alice" />
// → <Editor key="bob" />`,
    takeaway:
      "回答 Diff 时先解释身份和复用规则，再解释比较过程；不要把“虚拟 DOM 比较”说成每次销毁并重建整棵 DOM。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "principle-array-diff",
    title: "列表 Diff：顺序扫描、Map 与 lastPlacedIndex",
    group: "协调与 Diff",
    summary:
      "以 React 19.2 的普通 keyed 数组更新为例：先顺序尝试匹配，失配后为剩余旧节点建立 Map，再遍历剩余新节点，并标记插入、移动和删除。以下描述是实现细节，不是公开 API 契约。",
    points: [
      "快速路径逐个处理新旧节点。若新列表先结束，删除剩余旧节点；若旧列表先结束，为剩余新节点创建节点。",
      "需要查找时，把剩余旧节点按 key 放进 Map，无显式 key 时使用旧 index；新节点找到候选后仍需检查类型能否复用。",
      "lastPlacedIndex 记录已遍历的、可留在原相对顺序中的复用节点的最大旧索引。复用节点的 oldIndex 小于它时标记 Placement，否则更新该索引；新节点也标记 Placement。",
      "遍历完成后，Map 中未被复用的旧节点需要删除。标记在渲染阶段生成，实际宿主节点操作在提交阶段执行。",
      "下标 key 会让状态跟随位置，随机 key 会让身份每次变化。稳定业务 ID 保证身份匹配，但不保证零渲染或最少移动；该路径也不是 Vue 的双端 Diff / 最长递增子序列算法。",
    ],
    code: `// 简化推演：同一父级，每项类型均为 Row，key 为字母。
// 旧顺序：A(0), B(1), C(2), D(3)
// 新顺序：D, A, B, C
// 首项 key 失配，为剩余旧节点建立 Map。

// 新节点  旧索引  lastPlacedIndex  决策
// D       3      0 → 3            复用，无移动标记
// A       0      3                复用，标记移动
// B       1      3                复用，标记移动
// C       2      3                复用，标记移动

// 最终 DOM 顺序仍是 D,A,B,C，所有 Row 状态保留。
// 手工只移动 D 一次也能完成，说明此策略不求最少移动。
// Placement 对复用节点表示移动，对新节点表示插入。`,
    takeaway:
      "“能复用吗”和“需要移动吗”是两个问题；被移动的节点不等于被卸载后重新挂载。",
    source:
      "https://github.com/facebook/react/blob/v19.2.0/packages/react-reconciler/src/ReactChildFiber.js",
  },
  {
    id: "principle-fiber",
    title: "Fiber：把协调工作拆成可调度的单元",
    group: "Fiber 与调度",
    summary:
      "React element 描述想要的 UI，Fiber 保存组件工作单元的身份、状态、更新队列和树关系，宿主渲染器负责 DOM 等平台操作。Fiber 让 React 可以在工作单元之间让出主线程。",
    points: [
      "Fiber 通过 child、sibling、return 等字段组织树；函数组件的 Hook 状态关联在对应 Fiber 上，而不是保存在组件函数的普通局部变量中。",
      "current 表示已提交的树，workInProgress 准备下一次结果，两者通过 alternate 关联。准备过程可复用节点，不是每次深拷贝全部 DOM。",
      "render 阶段计算下一棵树和变更标记；并发渲染可以暂停、重试或丢弃。commit 阶段同步完成这次提交的 DOM 修改与布局相关工作，不按渲染时间片让出半成品界面。",
      "Scheduler 协助安排任务与让出时机，Reconciler 处理更新、协调和优先级，Renderer 应用平台变化；三者职责不同。",
      "并发不是多线程执行组件。React 不能在一个尚未返回的同步组件函数或长循环中任意暂停；重 CPU 工作仍需拆分或移到 Worker。",
    ],
    code: `// 学习用结构示意，省略了大量字段；不是 React 的完整实现。
const fiberSketch = {
  type: Counter,          // 组件类型
  key: 'counter',         // 同级身份
  memoizedState: null,   // 函数组件的 Hook 链表入口
  updateQueue: null,
  child: null,
  sibling: null,
  return: null,           // 父 Fiber
  alternate: null,        // current / workInProgress 的另一侧
  lanes: 0,              // 本节点待处理的更新优先级集合
  flags: 0,              // 提交阶段需要处理的工作标记
};
// 触发更新 → 排队与调度 → render / 协调 → commit → 浏览器绘制`,
    takeaway:
      "Diff 回答“复用和改变什么”，Fiber 支持拆分工作，调度决定“先处理哪些更新、何时让出”。",
    source:
      "https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react",
  },
  {
    id: "principle-update-queue",
    title: "更新队列：替换值与函数式更新如何组合",
    group: "更新与批处理",
    summary:
      "setter 把更新放入队列，React 在处理该队列时计算下一状态。值形式表达替换结果，函数形式接收队列计算到此处的状态；当前事件中的变量仍属于原渲染快照。",
    points: [
      "初始为 0 时，连续三次 setCount(count + 1) 都传入数值 1；三个 n => n + 1 则按 0 → 1 → 2 → 3 累加。",
      "混合更新按顺序处理：setCount(5)、setCount(n => n + 1)、setCount(42) 的最终值是 42，最后一次替换覆盖之前结果。",
      "类组件 setState 对对象进行浅合并；useState 的 setter 替换整个值，对象更新需要显式复制要保留的字段。两者的函数更新都应保持纯计算。",
      "相同状态可能被 Object.is 判断而跳过更新。不要靠组件函数或 updater 的调用次数安排业务副作用；开发 StrictMode 与并发重试都可能重复调用纯计算。",
    ],
    demo: PrincipleUpdateQueueDemo,
    code: principleUpdateQueueDemoCode,
    takeaway:
      "批处理描述更新的处理时机；队列规则描述状态怎么算。依赖前一个状态时，优先使用函数式更新。",
    source: "https://react.dev/learn/queueing-a-series-of-state-updates",
  },
  {
    id: "principle-setstate-timing",
    title: "setState 是同步还是异步？分开看调用与提交",
    group: "更新与批处理",
    summary:
      "setState / Hook setter 的调用本身同步执行，但它表达的是更新请求，不承诺返回时状态和 DOM 已更新。常见事件中的更新会被批处理；将它简单称为“同步函数”或“异步函数”都不足以解释行为。",
    points: [
      "函数组件每次渲染创建自己的变量和闭包；调用 setter 后，当前闭包中的 count 不会被改写，即使后来 DOM 已更新也是如此。",
      "类组件通过 this.state 读取实例状态；在批处理事件内不要紧跟 setState 读取新值。可用 setState 的第二个参数或 componentDidUpdate 观察提交后的状态。",
      "Hook setter 没有提交回调参数。需要计算下一值时在事件中计算或使用函数更新；需要与提交后的外部系统同步时使用 Effect，测量布局使用 useLayoutEffect。",
      "setter 不返回等待提交的 Promise。await setCount(...) 只会等待 undefined，不是 React 的提交屏障，await 后的旧闭包仍然读取旧值。",
      "React 17 的 legacy root 中，计时器等非批处理场景下类组件曾可立即观察到更新；React 18 createRoot 扩展了批处理，不能沿用“setTimeout 中一定同步”的口诀。",
    ],
    demo: PrincipleSetstateTimingDemo,
    code: principleSetstateTimingDemoCode,
    takeaway:
      "面试回答应交代 React 版本、根 API、调用场景，以及观察的是闭包变量、this.state 还是 DOM。",
    source: "https://react.dev/reference/react/Component#setstate",
  },
  {
    id: "principle-automatic-batching",
    title: "自动批量更新：版本、回调与 await 边界",
    group: "更新与批处理",
    summary:
      "批处理把一组更新集中处理，减少中间提交。React 18 使用 createRoot 后，Promise、setTimeout 和原生事件处理器中的多次更新也能自动批处理；本项目 React 19 沿用现代根的行为。",
    points: [
      "React 17 / React 18 legacy ReactDOM.render：默认主要批处理 React 事件处理器内的更新；React 18 createRoot 扩展范围。React 19 已移除旧 ReactDOM.render API。",
      "同一个计时器或 Promise 回调里的 setCount 和 setFlag 通常合并处理；这不意味着一次交互发起的所有异步任务都会合并成一次提交。",
      "await 把函数拆成不同执行段，不要依赖 await 前后保持同一批次；await 后同一段内的多个 setter 仍可自动批处理。",
      "不同有意触发的用户事件分别处理，避免前一次点击禁用提交按钮后，下一次点击仍重复提交。",
      "不要把自动批处理等同于固定一次组件调用；StrictMode、Suspense、Transition、flushSync 和相同值跳过更新都会影响观察结果。",
    ],
    demo: PrincipleAutomaticBatchingDemo,
    code: principleAutomaticBatchingDemoCode,
    takeaway:
      "批处理是调度与提交行为，不是把不同状态的业务值合成一个值，也不会修复过期闭包。",
    source:
      "https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching",
  },
  {
    id: "principle-flush-sync",
    title: "flushSync：同步刷新 DOM，闭包仍保持快照",
    group: "更新与批处理",
    summary:
      "与必须立即读取 DOM 的第三方接口集成时，可在事件处理器中使用 flushSync，让回调中的更新在函数返回前提交。它改变提交时机，不会改写已执行渲染留下的局部变量。",
    points: [
      "先 flushSync(() => setOpen(true))，再读取新挂载节点的 ref；读 DOM 与读旧闭包的结果需要分开解释。",
      "普通的提交后聚焦通常可通过 ref 或布局 Effect 完成；确实要求当前事件下一行就有新 DOM 时才考虑强制刷新。",
      "flushSync 可能连带处理其他待完成更新和 Effect，可能重新显示 Suspense fallback；它不是只刷新当前组件的隔离开关。",
      "不要在渲染或 Effect / 生命周期执行过程中调用 flushSync，也不要用它包住所有更新，否则会削弱批处理和并发带来的收益。",
    ],
    demo: PrincipleFlushSyncDemo,
    code: principleFlushSyncDemoCode,
    takeaway:
      "flushSync 等待的是同步提交；await setter 和延时计时器都不能代替这一语义。",
    source: "https://react.dev/reference/react-dom/flushSync",
  },
  {
    id: "principle-lanes",
    title: "Lanes 与 Transition：优先级、跳过与重放",
    group: "Fiber 与调度",
    summary:
      "React 用 Lanes 表示待处理工作的优先级集合。紧急输入可以先提交，Transition 对应的渲染可稍后完成；不同优先级更新仍需要通过保留队列和重放来维持正确的状态计算。",
    points: [
      "Lane 是内部位掩码表示，不应把具体数值当业务 API。节点记录自身与子树的待处理工作，根据此选择本轮要处理的更新。",
      "本轮优先级不足的更新会被保留，之后基于合适的基线重新处理；必要时已处理的后续更新也参与重放，避免晚到的低优先级结果覆盖较新的更新。",
      "startTransition 回调立即执行，标记的是其中状态更新对应的渲染优先级，不是把整个 JavaScript 函数放进后台线程。",
      "受控输入的 value 应保持紧急更新，把依赖输入的重列表渲染设为 Transition；必要时结合 memo 隔离未变化的列表子树。",
      "Transition 的中间渲染可被放弃；不能依赖每个中间状态都提交，也不能在 render 或 updater 中发送业务请求。",
    ],
    demo: PrincipleLanesDemo,
    code: principleLanesDemoCode,
    takeaway:
      "优先级让界面更及时响应，不让同步计算自动变快；并发更新也不等于异步请求按顺序返回。",
    source:
      "https://github.com/facebook/react/blob/v19.2.0/packages/react-reconciler/src/ReactFiberHooks.js",
  },
  {
    id: "principle-hook-storage",
    title: "Hooks 原理：按调用顺序关联状态",
    group: "Hooks 与副作用",
    summary:
      "以 useState / useEffect 为例，React 在函数组件对应的 Fiber 上维护 Hook 记录，渲染时按调用顺序遍历。重新调用组件函数能取回状态，依赖的是稳定的组件身份和 Hook 顺序。",
    points: [
      "挂载时建立 Hook 记录，更新时读取对应记录并处理各自的队列；React 不通过局部变量名识别哪个 state 属于哪个 useState。",
      "在条件、循环或提前返回之后调用常规 Hook，会使不同渲染的调用序列不一致；应把条件放到 Effect 内部或拆出独立子组件。",
      "自定义 Hook 复用逻辑，但其内部 Hook 仍属于调用它的组件；两个组件调用同一自定义 Hook，状态不会自动共享。",
      "React 19 的 use API 可在条件和循环中调用，是这条顺序规则的特例；它仍需在组件或 Hook 中调用，且不能放在 try/catch 中。",
    ],
    demo: PrincipleHookStorageDemo,
    code: principleHookStorageDemoCode,
    takeaway:
      "状态跟随组件身份和 Hook 顺序，不跟随局部变量名；常规 Hook 要在顶层稳定调用。",
    source: "https://react.dev/reference/rules/rules-of-hooks",
  },
  {
    id: "principle-effect-phases",
    title: "Effect 时序：渲染计算、DOM 提交与副作用清理",
    group: "Hooks 与副作用",
    summary:
      "组件函数负责计算 UI，Effect 用于在成功提交后与外部系统同步。useLayoutEffect 在浏览器重绘前处理布局相关工作；useEffect 通常适合连接、订阅等无需阻塞绘制的任务。",
    points: [
      "不要在 render 中发请求、订阅或修改 DOM；未提交就被丢弃的渲染不会执行对应 Effect 的 setup。",
      "依赖变化时，同一个 Effect 先用旧闭包执行 cleanup，再用新闭包执行 setup；卸载也会清理。清理不只发生在卸载。",
      "DOM 更新后，布局 Effect 可以读取布局，其同步工作与触发的更新会阻塞绘制；大量工作会直接拖慢交互。",
      "useEffect 不保证总在绘制之后执行：交互或布局 Effect 触发更新时，它可能提前执行。不要根据它与 requestAnimationFrame / setTimeout 的日志顺序建立业务依赖。",
      "开发 StrictMode 在适用场景额外运行 setup → cleanup → setup，检查清理是否对称；生产环境没有这轮开发检查。Effect 也不会在服务端渲染时运行。",
    ],
    demo: PrincipleEffectPhasesDemo,
    code: principleEffectPhasesDemoCode,
    takeaway:
      "解释时序时给出同一 Effect 的生命周期保证，避免承诺所有组件、所有任务之间固定的全局日志顺序。",
    source: "https://react.dev/reference/react/useEffect",
  },
];
