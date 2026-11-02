import type { InterviewEntry } from "../types";

export const stateEffectQuestions: InterviewEntry[] = [
  {
    id: "q-update-queue",
    title: "混合替换更新与函数更新，最终值是多少？",
    group: "状态与协调",
    interview: {
      kind: "代码推演",
      difficulty: "进阶",
      prompt:
        "初始 count 为 0，用户只点击一次。说明最终 DOM 显示值、事件内日志和计时器日志分别是多少，并解释将最后一次更新改成 setCount(count + 1) 后的变化。",
      questionCode: `// 以下代码位于组件的一次事件处理器内，count 初始为 0。
setCount(count + 1);
setCount(5);
setCount(n => n + 1);
console.log(count);
setTimeout(() => console.log(count), 0);`,
      followUps: [
        "若先 await 请求，再基于 count 发起两次更新，闭包中的 count 会自动更新吗？",
        "flushSync 能否让当前函数闭包中的 count 变量立即变成新值？",
      ],
      checks: [
        "按队列推导出 1 → 5 → 6，而不是只背诵批处理",
        "能区分闭包快照、更新队列和 DOM 提交时机",
        "指出 flushSync 同步提交也不会改写旧闭包",
      ],
    },
    summary:
      "最终界面显示 6，两条日志都读取此次渲染的 count，因此为 0。替换更新覆盖队列中此前的结果，函数更新消费队列当前值。",
    points: [
      "前两项分别把队列结果替换为 1 和 5，第三项把 5 递增为 6。",
      "若最后一项是 setCount(count + 1)，它传入的是固定值 1，最终显示 1。",
      "计时器等待多久都不会让闭包变量自动变化；依赖旧状态计算时使用函数式更新。",
    ],
    code: `import { useState } from 'react';
export default function Queue() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(n => n + 1);
    setCount(5);
    setCount(n => n + 1);
  }}>结果：{count}</button>;
}`,
    takeaway: "setter 请求更新；它不是对当前局部变量赋值。",
    source: "https://react.dev/learn/queueing-a-series-of-state-updates",
  },
  {
    id: "q-key-scope",
    title: "相同 key 能否跨父节点保留编辑状态？",
    group: "状态与协调",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "看板把同一张 Card 从“待办”列移动到“完成”列。两列都用 card.id 作为 key，但输入草稿消失了。解释原因，并设计既能换列又能保留草稿的状态模型。",
      followUps: [
        "把 Card 从 div 包裹改成 section 包裹，为什么也可能重置？",
        "如果产品要求换列后清空草稿，应该怎样明确表达？",
      ],
      checks: [
        "理解 key 只参与同一父节点下的身份匹配",
        "考虑组件类型与祖先结构变化导致的卸载",
        "将需跨位置保存的状态提升，并按业务 ID 索引",
      ],
    },
    summary:
      "key 不提供跨父节点的全局身份。移动到另一父节点会卸载旧 Card 并挂载新 Card；组件内部草稿随之丢失。",
    points: [
      "将草稿放到看板级或独立 store，以 card.id 为键保存；Card 变成受控编辑器。",
      "稳定 key 仍有必要，它解决同一列表中的排序匹配，但不能阻止跨父级重挂载。",
      "若草稿只需在原位置存活，可接受重置；需求决定状态生命周期，而不是盲目保留所有状态。",
    ],
    code: `// 看板父组件中的关键片段；drafts 的生命周期覆盖两列。
const [drafts, setDrafts] = useState({});
function updateDraft(id, value) {
  setDrafts(previous => ({ ...previous, [id]: value }));
}
function renderCard(card) {
  return <Card key={card.id} card={card}
    value={drafts[card.id] ?? ''}
    onChange={value => updateDraft(card.id, value)} />;
}`,
    takeaway: "状态属于组件在树中的身份；业务实体的长期状态应有独立所有者。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "q-nested-component",
    title: "输入一次就失焦，为什么不是 memo 能解决的问题？",
    group: "状态与协调",
    interview: {
      kind: "故障排查",
      difficulty: "进阶",
      prompt:
        "父组件每次输入后都会更新 state，InputEditor 定义在父函数内部。页面输入一次就失焦，局部状态也重置。如何验证是重挂载而非普通重渲染？",
      questionCode: `function Page() {
  const [name, setName] = useState('');
  function InputEditor() {
    return <input value={name} onChange={e => setName(e.target.value)} />;
  }
  return <InputEditor />;
}`,
      followUps: [
        "把 memo(InputEditor) 也放在父函数内部，问题会消失吗？",
        "Effect 的开发期额外清理如何与真实卸载区分？",
      ],
      checks: [
        "指出每次渲染创建了新的组件类型",
        "通过焦点、DOM 节点身份或 Profiler 挂载阶段定位",
        "将组件定义提升到模块级，通过 props 传入数据",
      ],
    },
    summary:
      "内部函数每次都是新的组件类型，React 会把旧子树替换为新子树。memo 也在内部重新创建时，无法稳定类型身份。",
    points: [
      "将组件声明移到模块顶层，不要用强制 focus 掩盖重挂载。",
      "稳定 props 能减少计算，但普通重渲染本身通常不会让同一个输入 DOM 失焦。",
      "排查时同时检查变化的 key、条件分支的不同祖先和嵌套组件定义。",
    ],
    code: `import { useState } from 'react';
function InputEditor({ value, onChange }) {
  return <input aria-label="名称" value={value}
    onChange={e => onChange(e.target.value)} />;
}
export default function Page() {
  const [name, setName] = useState('');
  return <InputEditor value={name} onChange={setName} />;
}`,
    takeaway: "先检查组件是否被销毁，再考虑如何减少重渲染。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "q-props-draft",
    title: "远端资料刷新，如何避免覆盖用户未保存的草稿？",
    group: "状态与协调",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "用户正在修改个人资料，后台轮询返回了更新的 user 对象。团队用 useEffect(() => setDraft(user), [user]) 同步，结果用户输入被覆盖。要求支持切换用户、后台刷新和冲突提示。",
      followUps: [
        "同一用户的远端 version 变化，要不要直接给编辑器换 key？",
        "保存成功响应比后续编辑更晚到达，如何更新基线而保留新草稿？",
      ],
      checks: [
        "区分远端基线、用户草稿和 dirty 状态",
        "实体身份变化与同实体版本刷新采用不同策略",
        "考虑字段级合并、显式冲突和用户确认",
      ],
    },
    summary:
      "不要把远端对象与草稿无条件同步。按实体 ID 创建编辑会话，分别保存基线版本、草稿和修改标记；同一实体刷新时再决定合并或提示。",
    points: [
      "切换 user.id 可以用 key 重建编辑器；同一用户的 version 更新不应自动丢弃 dirty 草稿。",
      "未修改字段可合并远端新值，已修改且远端也改变的字段展示冲突。",
      "提交携带基线 version；服务端拒绝过期写入。保存响应只确认对应提交快照，不覆盖之后继续编辑的内容。",
    ],
    code: `// 关键结构：实体切换重置；后台刷新交给编辑器的冲突策略。
<ProfileEditor key={user.id} remote={user} />

// 编辑器内分别保存数据职责。
const [base, setBase] = useState(remote);
const [draft, setDraft] = useState(remote);
const [dirtyFields, setDirtyFields] = useState(new Set());
// 保存时携带 base.version；收到新 remote 后按 dirtyFields 合并或提示。`,
    takeaway: "“用 Effect 同步 props”不是编辑会话的完整设计。",
    source: "https://react.dev/learn/you-might-not-need-an-effect",
  },
  {
    id: "q-state-invariants",
    title: "如何防止表单进入“成功且仍在提交”的非法状态？",
    group: "状态与协调",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "支付表单分别保存 loading、success、error 三个布尔状态。重试和重复响应让它们出现互相矛盾的组合。请设计状态转换，并说明 reducer 里应不应该发请求。",
      followUps: [
        "旧请求的 success 到达时，新请求已经启动，如何拒绝旧结果？",
        "如何为状态转换设计测试，而不是逐个测试 setter？",
      ],
      checks: [
        "使用互斥状态表达领域不变量",
        "通过 requestId 拒绝旧结果",
        "reducer 保持纯净，副作用有明确触发和取消边界",
      ],
    },
    summary:
      "用单个 status 或判别联合表达 idle / submitting / success / error，并把响应关联到请求 ID。reducer 只计算转换，不执行网络副作用。",
    points: [
      "成功和提交中天然互斥，错误状态同时携带错误信息，而不是额外维护多个可矛盾的布尔值。",
      "发起新请求时生成 requestId，完成 action 必须匹配当前请求才能生效。",
      "状态机能防止客户端非法转换，但支付幂等和去重仍必须由服务端保证。",
    ],
    code: `function reducer(state, action) {
  if (action.type === 'submit') {
    return { status: 'submitting', requestId: action.id };
  }
  if (action.id !== state.requestId || state.status !== 'submitting') {
    return state;
  }
  if (action.type === 'resolve') return { status: 'success' };
  if (action.type === 'reject') return { status: 'error', error: action.error };
  return state;
}`,
    takeaway: "让非法状态难以表示，比事后用 Effect 修补更可靠。",
    source: "https://react.dev/learn/choosing-the-state-structure",
  },
  {
    id: "q-external-snapshot",
    title: "外部 store 原地修改对象，为什么订阅后仍不更新？",
    group: "状态与协调",
    interview: {
      kind: "故障排查",
      difficulty: "专家",
      prompt:
        "useSyncExternalStore 的 getSnapshot 返回一个可变对象。store 修改了对象属性并触发通知，部分组件仍显示旧值；改成每次返回 {...store} 后又出现持续更新。解释两种错误并给出快照契约。",
      followUps: [
        "SSR 的 getServerSnapshot 如何与客户端首轮水合保持一致？",
        "多个组件读取同一个可变 store，为什么不能简单用 Effect + setState 替代协议？",
      ],
      checks: [
        "未变化时引用稳定，变化时返回新的不可变快照",
        "订阅函数有稳定身份并返回取消函数",
        "理解并发一致性与服务端初始快照的约束",
      ],
    },
    summary:
      "同引用会使快照比较看不到变化；每次新对象则让未变化的数据也像发生更新。应缓存不可变快照，只在数据确实变化时替换引用。",
    points: [
      "把可变 store 的内部结构与暴露给 React 的快照分开，必要时用版本号缓存快照。",
      "subscribe 保持稳定并清理监听器，getSnapshot 保持纯净，不在读取时写 store。",
      "SSR 把初始数据序列化给客户端，getServerSnapshot 返回同一份逻辑初值；不随意伪造浏览器状态。",
    ],
    code: `let snapshot = { count: 0 };
const listeners = new Set();
export const store = {
  getSnapshot: () => snapshot,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  increment() {
    snapshot = { count: snapshot.count + 1 };
    listeners.forEach(listener => listener());
  },
};`,
    takeaway: "快照的引用就是变化信号，必须与真实数据变化一致。",
    source: "https://react.dev/reference/react/useSyncExternalStore",
  },
  {
    id: "q-search-race",
    title: "搜索结果乱序：取消请求为什么还不够？",
    group: "Effects 与并发",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "用户依次输入 r、re、react，请求可能乱序返回，且解析或缓存层不一定支持取消。要求结果、错误和 loading 都只对应最新查询，清空查询和卸载也必须正确。",
      followUps: [
        "finally 无条件 setLoading(false) 会产生什么问题？",
        "防抖是否能保证已经发出的请求不会乱序？",
      ],
      checks: [
        "取消网络工作与拒绝过期提交分开处理",
        "成功、错误和 loading 都受有效性保护",
        "用确定可控的请求顺序验证，而不是依靠真实网络碰运气",
      ],
    },
    summary:
      "AbortController 尽量取消旧工作，Effect 清理标记或递增序号拒绝旧结果。只取消请求不足以覆盖不支持取消的后续处理。",
    points: [
      "每次查询创建自己的有效性标记，完成解析后再判断是否仍可提交。",
      "catch 和 finally 也必须检查有效性，避免旧错误和旧 loading 状态污染新请求。",
      "清空查询立即显示空结果；卸载触发清理。防抖只控制频率，不能替代竞态处理。",
    ],
    code: `useEffect(() => {
  let active = true;
  const controller = new AbortController();
  if (!query.trim()) { setState({ status: 'idle', items: [] }); return; }
  setState({ status: 'loading', items: [] });
  async function load() {
    try {
      const response = await fetch('/api/search?q=' + encodeURIComponent(query),
        { signal: controller.signal });
      if (!response.ok) throw new Error('搜索失败');
      const items = await response.json();
      if (active) setState({ status: 'success', items });
    } catch (error) {
      if (active) setState({ status: 'error', error, items: [] });
    }
  }
  load();
  return () => { active = false; controller.abort(); };
}, [query]);`,
    takeaway: "是否仍有资格更新界面，比请求是否返回更重要。",
    source: "https://react.dev/reference/react/useEffect",
  },
  {
    id: "q-effect-event-room",
    title: "切换主题就重连 WebSocket，该如何拆分依赖？",
    group: "Effects 与并发",
    interview: {
      kind: "故障排查",
      difficulty: "高级",
      prompt:
        "聊天连接由 roomId 和 token 决定，但连接成功通知要读取最新 theme。把 theme 放进依赖会重复重连，删掉又读到旧主题。要求换房间和换凭据时重连，换主题时不断线。",
      followUps: [
        "能把 roomId 也放进 useEffectEvent，然后把依赖写成 [] 吗？",
        "为何不能把 Effect Event 传给子组件当 onClick？",
      ],
      checks: [
        "分清连接生命周期依赖和事件展示所需的最新值",
        "正确使用 useEffectEvent 而非绕过依赖检查",
        "旧连接监听器与连接都要清理",
      ],
    },
    summary:
      "roomId、token 是真正的连接依赖；通知展示属于连接事件中的非响应式逻辑，可由 useEffectEvent 读取最新主题。",
    points: [
      "主题不决定连接身份，因此不需要重建连接；房间、凭据变化必须重新同步。",
      "Effect Event 只在本组件 Effect 逻辑中调用，不作为普通事件处理器或依赖。",
      "本地清理不能保证网络绝无重复消息；业务消息仍需有稳定 ID 做去重。",
    ],
    code: `const onConnected = useEffectEvent(() => notify('已连接', theme));
useEffect(() => {
  const connection = connectRoom({ roomId, token });
  const unsubscribe = connection.on('connected', () => onConnected());
  connection.connect();
  return () => { unsubscribe(); connection.disconnect(); };
}, [roomId, token]);
// connectRoom / notify 为模块级服务；本片段展示依赖边界。`,
    takeaway: "需要触发重同步的依赖不能藏进 Effect Event。",
    source: "https://react.dev/reference/react/useEffectEvent",
  },
  {
    id: "q-transition-cpu",
    title: "把 200ms 计算放进 startTransition，输入仍卡顿？",
    group: "Effects 与并发",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "startTransition(() => setRows(expensiveFilter(data))) 中 expensiveFilter 同步运行 200ms。解释为什么输入仍阻塞，并区分拆分组件渲染、Web Worker 与防抖各自适用的情况。",
      followUps: [
        "把函数包成 async 并在前面 await Promise.resolve() 能让 CPU 工作并行吗？",
        "列表只渲染 30 行时，为什么过滤 10 万条仍可能卡？",
      ],
      checks: [
        "知道 Transition 回调立即运行，不能中断任意同步函数",
        "区分单次 CPU 任务、可调度渲染和 DOM 数量",
        "用长任务和交互延迟指标验证改动",
      ],
    },
    summary:
      "Transition 调整 React 更新的调度优先级，不会把同步计算转成后台线程。长函数仍占用主线程直到返回。",
    points: [
      "简单过滤先优化算法、索引与数据量；巨大纯计算可交给 Worker 并通过请求 ID 处理乱序。",
      "将结果区拆成可被 React 调度的组件，配合延迟值或 Transition；单个组件内的长循环仍难以让出。",
      "虚拟化减少挂载节点，防抖减少调用次数，两者都不自动缩短一次 200ms 的计算。",
    ],
    code: `// Worker 通信关键片段：序号保护同样适用于线程外计算。
const latest = useRef(0);
function search(query) {
  const id = ++latest.current;
  worker.postMessage({ id, query });
}
useEffect(() => {
  const receive = event => {
    if (event.data.id === latest.current) setRows(event.data.rows);
  };
  worker.addEventListener('message', receive);
  return () => worker.removeEventListener('message', receive);
}, [worker]);`,
    takeaway: "调度优先级、调用频率和计算所在的线程是三个不同问题。",
    source: "https://react.dev/reference/react/useTransition",
  },
  {
    id: "q-deferred-network",
    title: "useDeferredValue 为何没有减少搜索请求？",
    group: "Effects 与并发",
    interview: {
      kind: "故障排查",
      difficulty: "高级",
      prompt:
        "团队把 query 改为 useDeferredValue(query)，再用该值触发请求，仍发现多次网络请求。产品要求输入即时回显、停止输入 300ms 后发请求，且结果区渲染不阻塞输入。",
      followUps: [
        "若请求已经发出，用户又输入一个字符，旧请求应如何处理？",
        "保留旧结果时如何避免用户以为它对应当前输入？",
      ],
      checks: [
        "将防抖、请求一致性与延迟渲染分层",
        "明确延迟值没有固定 300ms 的契约",
        "加载、陈旧结果和可访问性状态均有设计",
      ],
    },
    summary:
      "延迟值用于渲染调度，不承诺固定延时或请求去重。对请求单独防抖与取消，对昂贵结果渲染再使用延迟值。",
    points: [
      "受控输入始终同步更新 query，定时器在依赖变化时清理。",
      "debouncedQuery 变化后请求仍要防乱序，并正确区分清空、加载和错误。",
      "结果可保留上次成功数据，但应显示查询标签、陈旧状态或 aria-busy，不能只靠细微颜色变化。",
    ],
    code: `const [query, setQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');
useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(query), 300);
  return () => clearTimeout(timer);
}, [query]);
// 数据层按 debouncedQuery 请求，并处理取消与过期结果。
// 渲染层可将结果传给 memo 组件，再按需要使用 useDeferredValue。`,
    takeaway: "不要用渲染调度 API 代替网络层的频率与一致性策略。",
    source: "https://react.dev/reference/react/useDeferredValue",
  },
  {
    id: "q-strict-idempotency",
    title: "StrictMode 触发两次下单请求，关闭它对吗？",
    group: "Effects 与并发",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "页面挂载 Effect 中提交订单，开发期额外执行暴露了重复请求。团队准备关掉 StrictMode 或用 ref 限制“一次”。请从触发语义、请求取消和服务端一致性三个层面重构。",
      followUps: [
        "浏览器返回、刷新、重试也可能重复提交，ref 能覆盖吗？",
        "取消 fetch 是否意味着服务端事务一定取消？",
      ],
      checks: [
        "把用户操作移到事件或 Action，不把下单当挂载同步",
        "服务端按同一业务尝试的幂等键去重",
        "取消与 UI pending 不能代替事务安全",
      ],
    },
    summary:
      "下单是用户操作，应放在事件 / Action 中。StrictMode 只是暴露不可重复的挂载逻辑；关闭检查不会解决生产中的重试与重复到达。",
    points: [
      "按一次业务提交生成并复用幂等键，服务端保证去重和事务一致性，不是每次网络重试都生成新键。",
      "pending 禁用按钮减少误操作，但并发请求、重复回调和断网重试仍需服务端防护。",
      "AbortController 尽量停止客户端工作，不保证服务端已收到的请求撤销；需要查询最终订单状态。",
    ],
    code: `// 提交器关键片段：同一业务尝试复用 attemptKey。
async function submitOrder(order, attemptKey) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attemptKey },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error('下单失败，请查询订单状态后重试');
  return response.json();
}`,
    takeaway: "“仅执行一次”应有业务层定义，不能由某个组件是否挂载来保证。",
    source: "https://react.dev/reference/react/StrictMode",
  },
  {
    id: "q-layout-tooltip",
    title: "浮层首次闪烁且滚动后错位，如何排查？",
    group: "Effects 与并发",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "Tooltip 先出现在左上角，Effect 测量后才跳到按钮旁；放进滚动容器和 Portal 后位置又错了。请解释测量时机、坐标系、持续更新和性能取舍。",
      followUps: [
        "getBoundingClientRect 与 position:absolute / fixed 的坐标如何对应？",
        "服务端首次输出不存在布局信息，应如何处理浮层？",
      ],
      checks: [
        "必要测量放在 useLayoutEffect，并控制阻塞工作量",
        "定位方式与坐标系匹配，处理滚动和尺寸变化",
        "监听器、ResizeObserver 与动画帧均对称清理",
      ],
    },
    summary:
      "需要避免首次绘制错误位置时，在 useLayoutEffect 中测量。Portal 不改变几何学规则，应统一视口或定位祖先坐标。",
    points: [
      "fixed 浮层通常使用视口坐标；absolute 需要按实际 containing block 换算，注意 transform 产生的新包含块。",
      "尺寸变化可用 ResizeObserver；滚动和 resize 触发重算，必要时用 requestAnimationFrame 合并并取消。",
      "不要对全页所有组件使用 LayoutEffect。只在浮层打开时启用，先测后写，避免反复强制布局。",
    ],
    code: `useLayoutEffect(() => {
  const anchor = anchorRef.current;
  if (!anchor) return;
  const measure = () => {
    const rect = anchor.getBoundingClientRect();
    setPosition({ left: rect.left, top: rect.bottom + 8 });
  };
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(anchor);
  window.addEventListener('scroll', measure, true);
  window.addEventListener('resize', measure);
  return () => {
    observer.disconnect();
    window.removeEventListener('scroll', measure, true);
    window.removeEventListener('resize', measure);
  };
}, []);
// 浮层用 position: fixed；实际页面还应处理碰撞与浮层自身尺寸。`,
    takeaway: "时机正确仍不够，坐标系和持续同步边界也必须正确。",
    source: "https://react.dev/reference/react/useLayoutEffect",
  },
];
