import UseStateDemo from "./demos/useStateDemo";
import useStateDemoCode from "./demos/useStateDemo.tsx?raw";
import UseReducerDemo from "./demos/useReducerDemo";
import useReducerDemoCode from "./demos/useReducerDemo.tsx?raw";
import UseContextDemo from "./demos/useContextDemo";
import useContextDemoCode from "./demos/useContextDemo.tsx?raw";
import UseRefDemo from "./demos/useRefDemo";
import useRefDemoCode from "./demos/useRefDemo.tsx?raw";
import UseImperativeHandleDemo from "./demos/useImperativeHandleDemo";
import useImperativeHandleDemoCode from "./demos/useImperativeHandleDemo.tsx?raw";
import UseEffectDemo from "./demos/useEffectDemo";
import useEffectDemoCode from "./demos/useEffectDemo.tsx?raw";
import UseLayoutEffectDemo from "./demos/useLayoutEffectDemo";
import useLayoutEffectDemoCode from "./demos/useLayoutEffectDemo.tsx?raw";
import UseInsertionEffectDemo from "./demos/useInsertionEffectDemo";
import useInsertionEffectDemoCode from "./demos/useInsertionEffectDemo.tsx?raw";
import UseEffectEventDemo from "./demos/useEffectEventDemo";
import useEffectEventDemoCode from "./demos/useEffectEventDemo.tsx?raw";
import UseMemoDemo from "./demos/useMemoDemo";
import useMemoDemoCode from "./demos/useMemoDemo.tsx?raw";
import UseCallbackDemo from "./demos/useCallbackDemo";
import useCallbackDemoCode from "./demos/useCallbackDemo.tsx?raw";
import UseTransitionDemo from "./demos/useTransitionDemo";
import useTransitionDemoCode from "./demos/useTransitionDemo.tsx?raw";
import UseDeferredValueDemo from "./demos/useDeferredValueDemo";
import useDeferredValueDemoCode from "./demos/useDeferredValueDemo.tsx?raw";
import UseIdDemo from "./demos/useIdDemo";
import useIdDemoCode from "./demos/useIdDemo.tsx?raw";
import UseDebugValueDemo from "./demos/useDebugValueDemo";
import useDebugValueDemoCode from "./demos/useDebugValueDemo.tsx?raw";
import UseSyncExternalStoreDemo from "./demos/useSyncExternalStoreDemo";
import useSyncExternalStoreDemoCode from "./demos/useSyncExternalStoreDemo.tsx?raw";
import UseActionStateDemo from "./demos/useActionStateDemo";
import useActionStateDemoCode from "./demos/useActionStateDemo.tsx?raw";
import UseOptimisticDemo from "./demos/useOptimisticDemo";
import useOptimisticDemoCode from "./demos/useOptimisticDemo.tsx?raw";
import UseFormStatusDemo from "./demos/useFormStatusDemo";
import useFormStatusDemoCode from "./demos/useFormStatusDemo.tsx?raw";
import UseApiDemo from "./demos/useApiDemo";
import useApiDemoCode from "./demos/useApiDemo.tsx?raw";
import type { KnowledgeEntry } from "./types";

export const hookEntries: KnowledgeEntry[] = [
  {
    id: "useState",
    title: "useState",
    group: "状态",
    summary:
      "为组件保存状态。调用 setter 会请求下一次渲染，当前事件中的状态仍是本次渲染的快照。",
    points: [
      "适合输入值、展开状态、计数器等局部交互。",
      "依赖前一个值时使用函数式更新；对象和数组应创建新值。",
    ],
    demo: UseStateDemo,
    code: useStateDemoCode,
    takeaway: "setCount 不会修改当前闭包里的 count；它安排下一次渲染。",
    source: "https://react.dev/reference/react/useState",
  },
  {
    id: "useReducer",
    title: "useReducer",
    group: "状态",
    summary: "用 reducer 集中描述状态转换，把用户意图作为 action 分发。",
    points: [
      "适合多个字段联动、状态转换复杂的表单或编辑器。",
      "reducer 必须是纯函数；请求、计时器等副作用应放在其他位置。",
    ],
    demo: UseReducerDemo,
    code: useReducerDemoCode,
    takeaway: "useReducer 组织的是状态更新逻辑，并不会自动创建全局状态。",
    source: "https://react.dev/reference/react/useReducer",
  },
  {
    id: "useContext",
    title: "useContext",
    group: "上下文",
    summary: "读取并订阅上层最近的 Context，避免主题、语言等公共数据逐层透传。",
    points: [
      "Provider 必须位于消费组件上方。React 19 可直接使用 Context 作为 Provider。",
      "value 改变会更新消费者；拆分 Context 可减少无关更新。",
    ],
    demo: UseContextDemo,
    code: useContextDemoCode,
    takeaway: "memo 无法阻止组件响应它订阅的 Context 值变化。",
    source: "https://react.dev/reference/react/useContext",
  },
  {
    id: "useRef",
    title: "useRef",
    group: "引用",
    summary:
      "在多次渲染间保留一个可变引用，适合 DOM 节点和不参与界面展示的数据。",
    points: [
      "修改 ref.current 不会触发渲染。",
      "通常在事件或 Effect 中读写 ref；不要在渲染中依赖它计算界面。",
    ],
    demo: UseRefDemo,
    code: useRefDemoCode,
    takeaway: "需要让页面跟着变化的数据使用 state，保存命令式引用使用 ref。",
    source: "https://react.dev/reference/react/useRef",
  },
  {
    id: "useImperativeHandle",
    title: "useImperativeHandle",
    group: "引用",
    summary:
      "自定义组件通过 ref 向父级公开的能力，例如只暴露 focus，而不暴露完整 DOM。",
    points: [
      "React 19 的函数组件可直接接收 ref prop；旧版本通常需要 forwardRef。",
      "能用 props 表达的行为优先使用 props，避免过度命令式控制。",
    ],
    demo: UseImperativeHandleDemo,
    code: useImperativeHandleDemoCode,
    takeaway: "ref 是组件能力的边界，可以只公开调用方真正需要的方法。",
    source: "https://react.dev/reference/react/useImperativeHandle",
  },
  {
    id: "useEffect",
    title: "useEffect",
    group: "副作用",
    summary: "把组件与 React 之外的系统同步，例如事件订阅、网络连接和计时器。",
    points: [
      "依赖改变时，先执行旧清理，再执行新 setup；卸载时也会清理。",
      "列出使用到的响应式依赖。开发 StrictMode 会额外检查 setup / cleanup。",
    ],
    demo: UseEffectDemo,
    code: useEffectDemoCode,
    takeaway:
      "从现有 props / state 推导出的值直接在渲染时计算，不必再用 Effect 保存一份。",
    source: "https://react.dev/reference/react/useEffect",
  },
  {
    id: "useLayoutEffect",
    title: "useLayoutEffect",
    group: "副作用",
    summary: "在浏览器重绘之前测量布局并同步调整界面，适合避免定位闪烁。",
    points: [
      "它及其中的状态更新会阻塞重绘，仅在确实需要测量时使用。",
      "服务端没有布局信息；普通外部同步优先用 useEffect。",
    ],
    demo: UseLayoutEffectDemo,
    code: useLayoutEffectDemoCode,
    takeaway: "示例测量首次布局；持续监听尺寸变化通常应配合 ResizeObserver。",
    source: "https://react.dev/reference/react/useLayoutEffect",
  },
  {
    id: "useInsertionEffect",
    title: "useInsertionEffect",
    group: "副作用",
    summary: "在布局 Effect 执行前插入样式，主要面向 CSS-in-JS 库作者。",
    points: [
      "不用于业务请求或一般 DOM 测量，执行时不应假设 DOM 已更新或 ref 已连接。",
      "不能在其中更新 state，插入的资源也需要在清理函数中移除。",
    ],
    demo: UseInsertionEffectDemo,
    code: useInsertionEffectDemoCode,
    takeaway: "这是库层面的工具；普通页面优先使用 CSS 文件。",
    source: "https://react.dev/reference/react/useInsertionEffect",
  },
  {
    id: "useEffectEvent",
    title: "useEffectEvent",
    group: "副作用",
    summary:
      "React 19.2 新增：把 Effect 中的非响应式事件逻辑分离出来，同时读取最新提交的 props 和 state。",
    points: [
      "仅在本组件的 Effect 逻辑中调用，不能作为 onClick 或传给子组件。",
      "不是省略真实依赖的捷径；Effect Event 本身不放入依赖数组。",
    ],
    code: useEffectEventDemoCode,
    demo: UseEffectEventDemo,
    takeaway: "改变 step 后回调读取新值，但不需要重启这个计时器。",
    source: "https://react.dev/reference/react/useEffectEvent",
  },
  {
    id: "useMemo",
    title: "useMemo",
    group: "性能",
    summary:
      "在依赖未变化时复用计算结果，减少昂贵计算或为优化过的子组件保留引用。",
    points: [
      "计算函数保持纯净；依赖按 Object.is 比较。",
      "它是性能优化，业务正确性不能依赖缓存永久存在。",
    ],
    demo: UseMemoDemo,
    code: useMemoDemoCode,
    takeaway: "小数组示例展示写法；实际项目应先测量，再决定是否需要缓存。",
    source: "https://react.dev/reference/react/useMemo",
  },
  {
    id: "useCallback",
    title: "useCallback",
    group: "性能",
    summary: "缓存函数引用，常用于传递给 memo 子组件，或作为其他 Hook 的依赖。",
    points: [
      "依赖变化时返回新函数；它不会阻止函数被调用，也不会自动阻止渲染。",
      "使用函数式状态更新可减少对旧 state 的依赖。",
    ],
    demo: UseCallbackDemo,
    code: useCallbackDemoCode,
    takeaway: "useMemo 缓存计算结果；useCallback 缓存函数引用。",
    source: "https://react.dev/reference/react/useCallback",
  },
  {
    id: "useTransition",
    title: "useTransition",
    group: "并发",
    summary:
      "把部分状态更新标记为可中断的非紧急更新，并提供 isPending 表示过渡状态。",
    points: [
      "输入框本身的 value 应立即更新，耗时结果区可用 Transition。",
      "startTransition 回调会立即执行；它不会把同步耗时 JavaScript 移到后台线程。",
    ],
    code: useTransitionDemoCode,
    takeaway:
      "React 19 中 await 之后的状态更新目前仍需再包一层 startTransition 才能标记为过渡。",
    source: "https://react.dev/reference/react/useTransition",
    demo: UseTransitionDemo,
  },
  {
    id: "useDeferredValue",
    title: "useDeferredValue",
    group: "并发",
    summary: "返回一个可以滞后于原值更新的版本，让输入等紧急交互优先。",
    points: [
      "适合无法直接控制 setter 的场景，可配合 memo 降低结果区阻塞。",
      "没有固定延时，不等于防抖，也不会自动减少网络请求。",
    ],
    demo: UseDeferredValueDemo,
    code: useDeferredValueDemoCode,
    takeaway: "useTransition 包裹更新动作；useDeferredValue 延后消费一个值。",
    source: "https://react.dev/reference/react/useDeferredValue",
  },
  {
    id: "useId",
    title: "useId",
    group: "工具",
    summary:
      "生成组件实例内稳定的唯一 ID，用于关联 label、input 和无障碍描述。",
    points: [
      "支持服务端渲染与客户端水合时的 ID 匹配。",
      "不要用它生成列表 key；列表身份应来自业务数据。",
    ],
    demo: UseIdDemo,
    code: useIdDemoCode,
    takeaway: "重复渲染多个 EmailField 时，每个实例都能保持自己的关联。",
    source: "https://react.dev/reference/react/useId",
  },
  {
    id: "useDebugValue",
    title: "useDebugValue",
    group: "工具",
    summary:
      "给自定义 Hook 添加 React DevTools 调试标签，不会在页面中生成内容。",
    points: [
      "适合公共 Hook 或内部状态不易理解的 Hook。",
      "第二个参数可以延迟格式化调试值，直到 DevTools 检查它。",
    ],
    demo: UseDebugValueDemo,
    code: useDebugValueDemoCode,
    takeaway: "打开 React DevTools 的组件面板才能看到这项调试信息。",
    source: "https://react.dev/reference/react/useDebugValue",
  },
  {
    id: "useSyncExternalStore",
    title: "useSyncExternalStore",
    group: "外部订阅",
    summary:
      "以兼容并发渲染的方式订阅 React 外部的数据源，例如浏览器在线状态或状态库。",
    points: [
      "subscribe 必须返回取消订阅函数；getSnapshot 在数据未变时应返回相同快照。",
      "使用 SSR 时提供与首次水合一致的 getServerSnapshot。",
    ],
    demo: UseSyncExternalStoreDemo,
    code: useSyncExternalStoreDemoCode,
    takeaway: "不要在 getSnapshot 中每次创建新对象，否则可能反复触发更新。",
    source: "https://react.dev/reference/react/useSyncExternalStore",
  },
  {
    id: "useActionState",
    title: "useActionState",
    group: "表单与异步",
    summary:
      "管理 Action 的返回状态与 pending 状态，适合带校验和提交结果的表单。",
    points: [
      "Action 接收前一次状态和本次载荷；与 form action 配合时载荷是 FormData。",
      "通过 form action 或 Transition 调用分发函数，才能正确参与 Action 生命周期。",
    ],
    demo: UseActionStateDemo,
    code: useActionStateDemoCode,
    takeaway:
      "这里使用本地延迟演示；接入接口时应在 Action 中处理失败并返回可展示的错误。",
    source: "https://react.dev/reference/react/useActionState",
  },
  {
    id: "useOptimistic",
    title: "useOptimistic",
    group: "表单与异步",
    summary: "在异步 Action 完成前显示预期结果，完成后以真实状态为准。",
    points: [
      "乐观更新需要在 Action 或 Transition 中发起，更新函数保持纯净。",
      "失败时展示错误；真实状态未改变时，临时乐观值会回到真实值。",
    ],
    code: useOptimisticDemoCode,
    takeaway: "乐观值只负责即时反馈，真正持久化成功后仍需更新基础状态。",
    source: "https://react.dev/reference/react/useOptimistic",
    demo: UseOptimisticDemo,
  },
  {
    id: "useFormStatus",
    title: "useFormStatus",
    group: "表单与异步",
    summary:
      "来自 react-dom：读取父级表单最近一次提交的状态，包括 pending、data、method 和 action。",
    points: [
      "消费组件必须位于目标 form 内部；不能读取同一个组件里才返回的 form。",
      "适合封装能自动显示提交状态的按钮，配合函数式 form action 使用。",
    ],
    demo: UseFormStatusDemo,
    code: useFormStatusDemoCode,
    takeaway: "它从父级表单读取状态，不需要把 pending 一层层传给提交按钮。",
    source: "https://react.dev/reference/react-dom/hooks",
  },
  {
    id: "use-api",
    title: "use（补充 API）",
    group: "资源读取",
    summary:
      "读取 Context 或 Promise。它是 React API，官方将它与传统内置 Hooks 分开归类。",
    points: [
      "允许在条件或循环中调用，但仍必须位于组件或自定义 Hook 内。",
      "读取 Promise 时配合 Suspense 和错误边界；不要在每次客户端渲染时创建新的 Promise。",
    ],
    demo: UseApiDemo,
    code: useApiDemoCode,
    takeaway:
      "不要把 use 的条件调用规则套用到 useState、useEffect 等传统 Hook。",
    source: "https://react.dev/reference/react/use",
  },
];
