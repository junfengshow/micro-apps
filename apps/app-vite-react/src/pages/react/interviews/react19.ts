import type { InterviewEntry } from "../types";

export const react19Questions: InterviewEntry[] = [
  {
    id: "q-form-actions-contract",
    title: "表单 Action 接入后，pending 是否代表提交安全？",
    group: "React 19 与服务端",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "团队用 useActionState 与 useFormStatus 改写支付表单，认为 pending 禁用按钮就能防重复。另有提交按钮始终读取不到 pending。请检查组件结构、调用上下文、错误返回和服务端约束。",
      followUps: [
        "同一个组件中先调用 useFormStatus，再返回 form，能读到该 form 的状态吗？",
        "手动调用分发函数时，为什么可能需要 Transition？",
      ],
      checks: [
        "useFormStatus 消费祖先表单，而非本组件才返回的表单",
        "Action 正确接收 previousState 与载荷，预期错误可结构化返回",
        "将 UI 状态与权限校验、幂等、事务约束分开",
      ],
    },
    summary:
      "pending 是交互状态，不是事务锁。按钮必须作为目标 form 的后代读取 useFormStatus；Action 通过 form action 或适当的 Transition 上下文分发。",
    points: [
      "useActionState 的 Action 参数是 previousState、payload，与直接 form action 接收 FormData 的签名不同。",
      "表单校验失败可返回字段错误，异常可交给适当错误边界；不要把所有失败都吞成“成功”。",
      "服务端仍需认证、授权、权威数据校验、幂等和原子事务，前端 disabled 无法阻止伪造或重复请求。",
    ],
    code: `import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? '处理中' : '提交'}</button>;
}
function Checkout() {
  const [state, action] = useActionState(submitPayment, { error: null });
  return <form action={action}>
    <input name="orderId" required aria-label="订单号" />
    <Submit /><p role="status">{state.error}</p>
  </form>;
}
// submitPayment(previousState, formData) 是应用提供的服务适配函数。`,
    takeaway: "Action 组织提交生命周期，但不会替代业务与服务端的一致性协议。",
    source: "https://react.dev/reference/react/useActionState",
  },
  {
    id: "q-transition-await-order",
    title: "await 后的 Transition 更新与请求排序该怎么处理？",
    group: "React 19 与服务端",
    interview: {
      kind: "代码推演",
      difficulty: "高级",
      prompt:
        "切换商品规格会异步查询价格，用户快速点 A、B 两次，B 先返回，A 后返回。下方代码既存在过渡标记问题，也存在业务排序问题。请分别修复，不要把它们混为一谈。",
      questionCode: `startTransition(async () => {
  const price = await fetchPrice(sku);
  setPrice(price);
});`,
      followUps: [
        "内层 startTransition 能自动取消 A 请求吗？",
        "事件式查询与按 sku 同步的 Effect，分别怎样清理过期结果？",
      ],
      checks: [
        "React 19 当前约束下 await 后的 setter 再包 Transition",
        "请求序号或取消机制独立保证最新意图获胜",
        "非紧急更新不能控制输入框自身 value",
      ],
    },
    summary:
      "await 后的状态更新需要重新包入 startTransition 才能显式标记为过渡；而乱序必须通过请求身份、取消或有序 Action 协议处理。",
    points: [
      "Transition 不保证任意异步请求按用户意图排序，也不自动中止网络。",
      "用户选中的 sku 应立即更新；展示价格时标明它所属的 sku，避免新规格下短暂显示旧价格而无提示。",
      "成功和失败都检查请求是否仍有效，离开页面也应失效旧请求并处理异常。",
    ],
    code: `const latest = useRef(0);
useEffect(() => () => { latest.current += 1; }, []);
async function selectSku(sku) {
  setSelectedSku(sku);
  const id = ++latest.current;
  try {
    const price = await fetchPrice(sku);
    if (id !== latest.current) return;
    startTransition(() => setQuote({ sku, price }));
  } catch (error) {
    if (id === latest.current) setError(error);
  }
}`,
    takeaway: "更新优先级与异步结果归属是正交问题，必须分别处理。",
    source: "https://react.dev/reference/react/useTransition",
  },
  {
    id: "q-hydration-mismatch",
    title: "服务端正常，客户端水合报错：如何定位首屏不一致？",
    group: "React 19 与服务端",
    interview: {
      kind: "故障排查",
      difficulty: "高级",
      prompt:
        "SSR 页面使用 Date.now、随机 ID、本地时区格式化和 localStorage 主题，水合时发生不匹配。团队准备全局 suppressHydrationWarning。给出系统排查和最小修复方案。",
      followUps: [
        "useId 能否修复服务端和客户端组件树本来就不同的问题？",
        "必须显示客户端专属信息时，如何在不污染首轮水合的情况下更新？",
      ],
      checks: [
        "要求服务端输出与客户端首次渲染匹配",
        "将初始数据快照、时区与稳定 ID 显式传入",
        "警告抑制仅作受限逃生口，不代替一致性修复",
      ],
    },
    summary:
      "hydrateRoot 要求客户端首次 UI 与服务端 HTML 匹配。先排查数据快照和非确定性输入，再检查不合法 HTML 结构、分支与第三方修改。",
    points: [
      "服务端生成 timestamp / locale / 初始主题并序列化给客户端，避免两端各算一次不同值。",
      "无障碍 ID 可使用 useId，但前提是树结构一致；列表 key 仍来自业务数据。",
      "客户端专属内容可在挂载后更新，评估额外渲染与闪烁；少量不可避免文本才局部抑制警告。",
      "通过 onRecoverableError 收集错误和组件栈，定位边界，不应在真实水合测试前掩盖全部警告。",
    ],
    code: `// 服务端将 initialTime 与 locale 序列化给客户端，两端使用同一值。
function TimeLabel({ initialTime, locale, timeZone }) {
  const label = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium', timeStyle: 'short', timeZone,
  }).format(new Date(initialTime));
  return <time dateTime={initialTime}>{label}</time>;
}
hydrateRoot(document.getElementById('root'), <App {...initialData} />, {
  onRecoverableError: (error, info) => report(error, info.componentStack),
});`,
    takeaway:
      "水合错误通常是两次首轮渲染的输入不一致，而不是需要强制忽略的噪声。",
    source: "https://react.dev/reference/react-dom/client/hydrateRoot",
  },
  {
    id: "q-rsc-ssr-boundary",
    title: "SSR、Server Components 与 Server Functions 如何区分？",
    group: "React 19 与服务端",
    interview: {
      kind: "原理分析",
      difficulty: "专家",
      prompt:
        "团队认为“有 SSR 就有 RSC”“use client 组件只在浏览器运行”“加 use server 即可在 Vite 页面查数据库”。请指出边界，并说明客户端到服务端的数据与权限约束。",
      followUps: [
        "Server Component 能否通过 children 组合进 Client Component？",
        "Server Function 可由客户端触发时，权限校验为什么必须在服务端函数内做？",
      ],
      checks: [
        "区分 HTML 生成、服务器组件执行和服务端调用三个维度",
        "知道客户端组件也可能参与首屏 SSR",
        "明确需要框架 / bundler 支持与可序列化协议",
      ],
    },
    summary:
      "SSR 生成首屏 HTML；RSC 让部分组件在服务端环境执行并产出可传输结果；Server Functions 提供可由客户端调用的服务端函数边界。它们可以配合，但不是同义词。",
    points: [
      "use client 声明客户端模块边界，不表示组件绝不会参与服务端首屏渲染。",
      "RSC 代码不能像客户端组件那样使用交互 state 和浏览器 API；跨边界参数必须符合框架支持的序列化协议。",
      "普通 Vite CSR 工程不会因字符串指令自动得到服务端运行时；需要对应框架和构建协议。",
      "服务端函数是可被调用的入口，每次验证身份、资源权限与输入；不能只依赖按钮是否可见。",
    ],
    code: `// 以下是支持 RSC 的框架中的结构示意，不是当前 Vite 的运行入口。
async function ProductPage({ id }) {
  const product = await loadProductOnServer(id);
  return <ClientCart productId={product.id} title={product.title} />;
}
// ClientCart 在另一个以 'use client' 开头的模块中定义。
// 只传允许跨边界的数据，不把数据库连接或任意闭包传给客户端。`,
    takeaway: "先说明代码在哪个环境执行，再讨论它能读取什么、能调用什么。",
    source: "https://react.dev/reference/rsc/server-components",
  },
  {
    id: "q-suspense-waterfall",
    title: "加了 Suspense 还是串行加载，如何消除请求瀑布？",
    group: "React 19 与服务端",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "资料页先加载用户组件，用户成功后才挂载活动组件并请求活动。它们被包在同一个 Suspense 中，首屏总耗时仍接近两个请求之和。如何拆分发起时机、数据依赖和展示边界？",
      followUps: [
        "若活动确实需要 user.id，哪些请求仍有可能提前？",
        "把多个边界嵌套是否必然让网络并行？",
      ],
      checks: [
        "区分请求发起时机与 fallback 展示边界",
        "独立数据提前并行启动，真正依赖保留串行",
        "普通 Effect fetch 不会自动参与 Suspense",
      ],
    },
    summary:
      "Suspense 负责等待时的展示，不会自动提前发起隐藏在后续挂载中的请求。需要在路由数据层或资源层更早启动独立工作。",
    points: [
      "若 user 和 activity 已知同一 route ID，可在 loader / 服务端层并行请求，再按产品优先级决定边界。",
      "仅在数据真实依赖时串行；可预加载的代码和元数据仍应提前启动。",
      "采用支持 Suspense 的框架或缓存资源协议，避免在渲染中随手新建 Promise 反复请求。",
      "错误边界与重试策略单独设计；过渡可保留已展示内容，但不能用它隐藏永久失败。",
    ],
    code: `// 路由数据层关键片段：独立工作从同一时点启动。
async function loadProfile(routeId, signal) {
  const [user, activity] = await Promise.all([
    fetchUser(routeId, signal),
    fetchActivity(routeId, signal),
  ]);
  return { user, activity };
}
// 如需流式逐步展示，由所用框架的 loader / 资源协议组织 Promise 边界。`,
    takeaway: "边界决定等待时显示什么，数据层决定等待从什么时候开始。",
    source: "https://react.dev/reference/react/Suspense",
  },
  {
    id: "q-use-promise-resource",
    title: "use(fetch(...)) 为什么可能反复挂起？如何设计资源生命周期？",
    group: "React 19 与服务端",
    interview: {
      kind: "故障排查",
      difficulty: "专家",
      prompt:
        "客户端组件每次 render 都调用 use(fetch(url).then(r => r.json()))。出现未缓存 Promise 警告或不断挂起。团队想用组件内 useMemo 永久缓存，或 try/catch 吃掉异常。分析问题并给出资源边界。",
      followUps: [
        "首次挂载因挂起而重试，组件内 useMemo 是可靠的资源缓存吗？",
        "不同用户的同 URL 数据能否共用一个没有权限范围的全局 Map？",
      ],
      checks: [
        "Promise 身份与查询资源生命周期稳定，不依赖单次渲染缓存",
        "通过 Suspense 处理挂起，Error Boundary 处理失败",
        "资源键包含权限 / 参数，具备失效、重试和内存清理策略",
      ],
    },
    summary:
      "每次 render 都创建新 Promise，会让同一资源读取持续面对新的等待对象。应从支持 Suspense 的框架 / 数据层获取稳定 Promise，不能依赖可能被丢弃的渲染缓存实现数据正确性。",
    points: [
      "Promise 的创建与缓存放在清晰的资源所有者处；SSR 场景可由服务端传入稳定资源。",
      "use 的挂起机制交给 Suspense，不用 try/catch 包住 use；失败由 Error Boundary 或提前转换后的资源处理。",
      "重试需要明确替换失败资源和重置边界，失效要覆盖参数变化、用户切换与缓存回收。",
      "不要为演示随意在模块级永久共享用户私有数据；当前 Vite 页面不会自动获得框架的数据缓存协议。",
    ],
    code: `import { Suspense, use } from 'react';
function Article({ resource }) {
  const article = use(resource);
  return <h2>{article.title}</h2>;
}
function ArticleBoundary({ stablePromise }) {
  return <Suspense fallback={<p>加载中</p>}>
    <Article resource={stablePromise} />
  </Suspense>;
}
// stablePromise 由具有生命周期和缓存策略的数据层提供；外层另设错误边界。`,
    takeaway: "缓存是资源协议，不只是给 render 中的一行代码包 useMemo。",
    source: "https://react.dev/reference/react/use",
  },
];
