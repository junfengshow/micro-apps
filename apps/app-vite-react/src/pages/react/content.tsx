import DeclarativeDemo from "./demos/declarativeDemo";
import declarativeDemoCode from "./demos/declarativeDemo.tsx?raw";
import ComponentsPropsDemo from "./demos/componentsPropsDemo";
import componentsPropsDemoCode from "./demos/componentsPropsDemo.tsx?raw";
import SnapshotDemo from "./demos/snapshotDemo";
import snapshotDemoCode from "./demos/snapshotDemo.tsx?raw";
import IdentityDemo from "./demos/identityDemo";
import identityDemoCode from "./demos/identityDemo.tsx?raw";
import PureRenderDemo from "./demos/pureRenderDemo";
import pureRenderDemoCode from "./demos/pureRenderDemo.tsx?raw";
import EventHandlerDemo from "./demos/eventHandlerDemo";
import eventHandlerDemoCode from "./demos/eventHandlerDemo.tsx?raw";
import PropagationDemo from "./demos/propagationDemo";
import propagationDemoCode from "./demos/propagationDemo.tsx?raw";
import PreventDefaultDemo from "./demos/preventDefaultDemo";
import preventDefaultDemoCode from "./demos/preventDefaultDemo.tsx?raw";
import EventBatchingDemo from "./demos/eventBatchingDemo";
import eventBatchingDemoCode from "./demos/eventBatchingDemo.tsx?raw";
import RenderCommitDemo from "./demos/renderCommitDemo";
import renderCommitDemoCode from "./demos/renderCommitDemo.tsx?raw";
import MemoBoundaryDemo from "./demos/memoBoundaryDemo";
import memoBoundaryDemoCode from "./demos/memoBoundaryDemo.tsx?raw";
import SuspenseDemo from "./demos/suspenseDemo";
import suspenseDemoCode from "./demos/suspenseDemo.tsx?raw";
import ProfilerDemo from "./demos/profilerDemo";
import profilerDemoCode from "./demos/profilerDemo.tsx?raw";
import CustomHooksDemo from "./demos/customHooksDemo";
import customHooksDemoCode from "./demos/customHooksDemo.tsx?raw";
import LiftingStateDemo from "./demos/liftingStateDemo";
import liftingStateDemoCode from "./demos/liftingStateDemo.tsx?raw";
import RaceConditionsDemo from "./demos/raceConditionsDemo";
import raceConditionsDemoCode from "./demos/raceConditionsDemo.tsx?raw";
import ErrorBoundaryDemo from "./demos/errorBoundaryDemo";
import errorBoundaryDemoCode from "./demos/errorBoundaryDemo.tsx?raw";
import { hookEntries } from "./hooks";
import { interviewEntries } from "./interviews";
import { principleEntries } from "./principles";
import type { KnowledgeCategory, KnowledgeEntry } from "./types";

const foundations: KnowledgeEntry[] = [
  {
    id: "declarative",
    title: "声明式 UI：先描述状态，再描述界面",
    group: "思维方式",
    summary:
      "把界面看成 props 和 state 的计算结果。交互改变状态，由 React 更新界面。",
    points: [
      "先拆分组件，写静态版本，再找出最少且完整的 state。",
      "可以从现有数据算出的值不重复存储，避免多个状态互相同步。",
    ],
    demo: DeclarativeDemo,
    code: declarativeDemoCode,
    takeaway: "先问“现在是什么状态”，再写“这个状态下应该显示什么”。",
    source: "https://react.dev/learn/thinking-in-react",
  },
  {
    id: "components-props",
    title: "组件、JSX 与单向数据流",
    group: "组件基础",
    summary:
      "组件是返回 UI 的函数；props 是只读输入，children 让组件通过组合复用结构。",
    points: [
      "组件名首字母大写，JSX 只是描述 UI 的语法。",
      "父级通过 props 传数据，子级通过回调表达用户意图，不直接修改父级数据。",
    ],
    demo: ComponentsPropsDemo,
    code: componentsPropsDemoCode,
    takeaway: "复用行为和结构时优先考虑组合，而不是组件继承。",
    source: "https://react.dev/learn/passing-props-to-a-component",
  },
  {
    id: "snapshot",
    title: "状态快照与不可变更新",
    group: "状态模型",
    summary:
      "每次渲染都有自己的 state 和事件闭包。更新 state 是请求新快照，不是修改旧快照。",
    points: [
      "对象深层更新要逐层复制，数组可使用 map、filter 等生成新值。",
      "直接修改原对象再传回相同引用，可能被 React 跳过更新。",
    ],
    demo: SnapshotDemo,
    code: snapshotDemoCode,
    takeaway: "把 state 当作只读数据，以新对象表达新的状态。",
    source: "https://react.dev/learn/state-as-a-snapshot",
  },
  {
    id: "identity",
    title: "列表 key 与组件身份",
    group: "组件基础",
    summary:
      "React 用树中的位置、组件类型和 key 区分组件身份，决定保留还是重置状态。",
    points: [
      "列表使用稳定的业务 ID；会排序、增删的列表不宜用下标。",
      "key 只在同级间需要唯一；它不会作为普通 prop 传入组件。",
    ],
    demo: IdentityDemo,
    code: identityDemoCode,
    takeaway: "切换 key 会重置整个子树状态，可用于切换用户时清空草稿。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "pure-render",
    title: "纯渲染：让组件可以被安全地重算",
    group: "思维方式",
    summary:
      "相同输入应产生相同 UI；不要在渲染时修改外部变量、发送请求或操作 DOM。",
    points: [
      "渲染可能被重复执行、暂停或丢弃，副作用应留给事件和 Effect。",
      "开发 StrictMode 会额外调用部分逻辑来暴露不纯行为，不代表生产环境重复提交。",
    ],
    demo: PureRenderDemo,
    code: pureRenderDemoCode,
    takeaway: "一次渲染应该只计算，不应该偷偷改变外部世界。",
    source: "https://react.dev/learn/keeping-components-pure",
  },
];

const events: KnowledgeEntry[] = [
  {
    id: "event-handler",
    title: "传递事件处理函数，而不是执行结果",
    group: "事件绑定",
    summary: "onClick 接收一个函数。需要参数时用闭包包装，等用户操作时再执行。",
    points: [
      "onClick={handleClick} 传递函数；onClick={handleClick()} 在渲染时调用它。",
      "自定义组件可用 onSelect 等语义化回调，原生元素使用 onClick 等标准名称。",
    ],
    demo: EventHandlerDemo,
    code: eventHandlerDemoCode,
    takeaway: "函数引用交给 React，调用时机留给用户交互。",
    source: "https://react.dev/learn/responding-to-events",
  },
  {
    id: "propagation",
    title: "捕获、目标与冒泡",
    group: "事件传播",
    summary:
      "常见事件先经过捕获处理，再到目标，最后沿祖先冒泡。React 通过合成事件提供一致接口。",
    points: [
      "onClickCapture 监听捕获，onClick 监听冒泡。stopPropagation 阻止进一步传播。",
      "target 是事件来源；currentTarget 是当前处理器绑定的节点。React 的 onScroll 不冒泡。",
    ],
    demo: PropagationDemo,
    code: propagationDemoCode,
    takeaway: "stopPropagation 不会撤销已经执行过的捕获处理器。",
    source: "https://react.dev/learn/responding-to-events",
  },
  {
    id: "prevent-default",
    title: "阻止默认行为与受控输入",
    group: "表单事件",
    summary:
      "preventDefault 阻止浏览器默认行为；受控输入通过 value 和 onChange 保持状态同步。",
    points: [
      "阻止默认提交不会自动停止冒泡，两者解决不同问题。",
      "受控 input 的 value 从一开始就应是字符串，避免在受控与非受控之间切换。",
    ],
    demo: PreventDefaultDemo,
    code: preventDefaultDemoCode,
    takeaway:
      "在 React 中返回 false 不会代替 preventDefault 或 stopPropagation。",
    source: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "event-batching",
    title: "事件中的批量更新与闭包",
    group: "更新机制",
    summary:
      "同一次事件中多次读取 state，得到的是同一个快照；函数式更新则按队列依次计算。",
    points: [
      "连续三次 setCount(count + 1) 通常只增加一次，因为都传入同一个目标值。",
      "现代 React 还会批处理 Promise、计时器等回调中的更新；不同用户事件保持独立。",
    ],
    demo: EventBatchingDemo,
    code: eventBatchingDemoCode,
    takeaway: "批处理决定何时渲染，更新队列决定下一份状态的值。",
    source: "https://react.dev/learn/queueing-a-series-of-state-updates",
  },
];

const rendering: KnowledgeEntry[] = [
  {
    id: "render-commit",
    title: "触发 → 渲染 → 提交 → 绘制",
    group: "渲染模型",
    summary:
      "渲染阶段计算下一棵 UI 树，提交阶段把必要变化应用到 DOM，最后浏览器绘制。",
    points: [
      "组件函数再次执行，不代表 DOM 一定变化。",
      "渲染阶段可被中断，已提交的 DOM 变化和 Effect 生命周期需要保持一致。",
    ],
    demo: RenderCommitDemo,
    code: renderCommitDemoCode,
    takeaway: "性能分析应区分计算耗时、DOM 提交和浏览器布局绘制。",
    source: "https://react.dev/learn/render-and-commit",
  },
  {
    id: "memo-boundary",
    title: "memo 与稳定的 props",
    group: "性能优化",
    summary:
      "memo 通常在 props 不变时跳过父组件带来的重渲染。它不会屏蔽组件自己的 state 或 Context 更新。",
    points: [
      "默认逐项使用 Object.is 比较 props。每次新建的对象和函数会影响比较。",
      "先定位慢组件，再考虑 memo；别把缓存当成业务正确性的前提。",
    ],
    demo: MemoBoundaryDemo,
    code: memoBoundaryDemoCode,
    takeaway: "缓存有成本，合理的状态归属和组件拆分通常应先于手动 memo。",
    source: "https://react.dev/reference/react/memo",
  },
  {
    id: "suspense",
    title: "Suspense 与按需加载",
    group: "加载边界",
    summary:
      "Suspense 为尚未准备好的子树显示 fallback。配合 lazy 可按需加载组件代码。",
    points: [
      "lazy 在模块顶层声明，不在组件渲染时重复创建。",
      "普通 useEffect 内的 fetch 不会自动触发 Suspense；资源需使用支持 Suspense 的读取方式。",
    ],
    demo: SuspenseDemo,
    code: suspenseDemoCode,
    takeaway: "加载用 Suspense，渲染错误用 Error Boundary，两种边界职责不同。",
    source: "https://react.dev/reference/react/Suspense",
  },
  {
    id: "profiler",
    title: "先测量，再优化",
    group: "性能优化",
    summary:
      "使用 Profiler 和 React DevTools 检查提交与渲染耗时，确认瓶颈属于计算、渲染还是网络。",
    points: [
      "开发模式、StrictMode 与实际生产性能不同，不要只用 console 次数下结论。",
      "大列表先考虑虚拟化，代码体积考虑拆包，昂贵交互再考虑缓存或过渡。",
    ],
    demo: ProfilerDemo,
    code: profilerDemoCode,
    takeaway:
      "Profiler 会增加开销，正式采样应使用支持 profiling 的构建并结合真实设备。",
    source: "https://react.dev/reference/react/Profiler",
  },
];

const patterns: KnowledgeEntry[] = [
  {
    id: "custom-hooks",
    title: "自定义 Hook：共享逻辑，各自保存状态",
    group: "逻辑复用",
    summary:
      "把可复用的状态和生命周期逻辑提取为 use 开头的函数，每次调用仍拥有独立状态。",
    points: [
      "自定义 Hook 遵守相同的顶层调用规则。",
      "共享逻辑不等于共享状态；需要共享数据时将状态提升或使用 Context / store。",
    ],
    demo: CustomHooksDemo,
    code: customHooksDemoCode,
    takeaway: "两个 useToggle 调用互不影响，即使它们来自同一个 Hook。",
    source: "https://react.dev/learn/reusing-logic-with-custom-hooks",
  },
  {
    id: "lifting-state",
    title: "状态提升与单一数据源",
    group: "状态设计",
    summary:
      "多个组件需要协调时，把共享状态放在最近的共同父级，通过 props 和回调连接。",
    points: [
      "每份状态都有明确的所有者，避免兄弟组件各存一份再互相同步。",
      "局部交互状态尽量留在局部，不必把所有状态都放到全局。",
    ],
    demo: LiftingStateDemo,
    code: liftingStateDemoCode,
    takeaway: "先决定谁拥有状态，再决定谁需要读取和修改它。",
    source: "https://react.dev/learn/sharing-state-between-components",
  },
  {
    id: "race-conditions",
    title: "异步请求：清理与过期结果",
    group: "异步实践",
    summary:
      "参数快速变化时，先发出的请求可能后返回。清理旧 Effect，避免旧结果覆盖新结果。",
    points: [
      "真实 fetch 可同时使用 AbortController 取消请求，并正确区分取消和其他错误。",
      "下面用本地请求演示过期结果忽略；框架 loader 或缓存库可进一步处理复用和瀑布请求。",
    ],
    demo: RaceConditionsDemo,
    code: raceConditionsDemoCode,
    takeaway: "清理保护的是这一次 Effect 的生命周期，不只是卸载场景。",
    source: "https://react.dev/reference/react/useEffect",
  },
  {
    id: "error-boundary",
    title: "错误边界：为失败保留可用界面",
    group: "可靠性",
    summary:
      "用 Error Boundary 捕获子树渲染期间的错误，展示替代 UI，并在 componentDidCatch 上报。",
    points: [
      "不会自动捕获事件处理器、任意异步回调、服务端渲染中的错误或边界自身错误。",
      "按页面或功能区放置边界，避免一个局部失败破坏整个界面。",
    ],
    demo: ErrorBoundaryDemo,
    code: errorBoundaryDemoCode,
    takeaway:
      "渲染错误由边界兜底，用户操作中的失败仍需在对应事件 / Action 中处理。",
    source:
      "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
  },
];

export const categories: KnowledgeCategory[] = [
  {
    id: "foundations",
    label: "基础与哲学",
    caption: "建立正确的心智模型",
    number: "01",
    description: "从声明式思维出发，把组件、状态与数据流连成一条清晰的线。",
    entries: foundations,
  },
  {
    id: "events",
    label: "事件系统",
    caption: "让交互变得可解释",
    number: "02",
    description:
      "理解事件绑定、传播、默认行为与批量更新，知道点击之后究竟发生了什么。",
    entries: events,
  },
  {
    id: "hooks",
    label: "Hooks 全解",
    caption: "作用、边界与使用示例",
    number: "03",
    description:
      "覆盖 React 19.2+ 的 18 个稳定内置 Hook，补充 react-dom 的 useFormStatus 与 use API。每项都附作用、注意点、完整源码和可运行示例。",
    entries: hookEntries,
  },
  {
    id: "principles",
    label: "核心原理",
    caption: "Diff、Fiber 与更新机制",
    number: "04",
    description:
      "从协调与列表 Diff 到 Fiber、更新队列、setState 时机、自动批处理、优先级与 Hooks，用机制解释现象，并区分 React 18/19 与旧版本行为。源码细节以 React 19.2 为例。",
    entries: principleEntries,
  },
  {
    id: "rendering",
    label: "渲染与性能",
    caption: "理解更新，找到瓶颈",
    number: "05",
    description: "区分渲染和提交，掌握缓存边界、异步加载与性能测量。",
    entries: rendering,
  },
  {
    id: "patterns",
    label: "实践模式",
    caption: "把知识放回真实场景",
    number: "06",
    description:
      "从状态设计、逻辑复用到异步清理与错误边界，建立可维护的组件习惯。",
    entries: patterns,
  },
  {
    id: "interview",
    label: "面试题与答案",
    caption: "原理推演、排障与场景设计",
    number: "07",
    description: `${interviewEntries.length} 道进阶至专家题，覆盖 Diff、Fiber、setState 与批处理、Hooks、状态与协调、并发、性能架构、工程场景及 React 19 与服务端。每题含题设、参考答案、关键代码、追问与评价要点。`,
    entries: interviewEntries,
  },
];

export function searchEntries(
  entries: KnowledgeEntry[],
  query: string,
  group = "全部"
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    if (group !== "全部" && entry.group !== group) return false;
    const text = [
      entry.title,
      entry.group,
      entry.summary,
      ...entry.points,
      entry.takeaway,
      entry.code,
      entry.interview?.prompt || "",
      entry.interview?.questionCode || "",
      entry.interview?.difficulty || "",
      entry.interview?.kind || "",
      ...(entry.interview?.followUps || []),
      ...(entry.interview?.checks || []),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
