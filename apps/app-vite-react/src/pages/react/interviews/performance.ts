import type { InterviewEntry } from "../types";

export const performanceQuestions: InterviewEntry[] = [
  {
    id: "q-large-list",
    title: "一万行列表输入卡顿，如何给出可验证的优化方案？",
    group: "性能与架构",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "每次输入都会过滤一万条数据并渲染列表。有人主张给所有组件加 memo，有人只加 Transition。请先设计定位流程，再分别处理计算量、DOM 数量、状态传播和请求量。",
      followUps: [
        "行高不固定且数据追加，如何避免滚动跳动？",
        "优化后 commit 更少但 INP 仍差，应检查哪里？",
      ],
      checks: [
        "采样真实交互而不是只数 console.log",
        "能将虚拟化、缓存、Worker 与过渡对应到不同瓶颈",
        "给出输入延迟、长任务、渲染耗时与挂载节点数的验证口径",
      ],
    },
    summary:
      "先复现并用 React Profiler 和性能面板区分计算、React 渲染、提交、布局与网络。针对瓶颈组合优化，而不是把所有开关都打开。",
    points: [
      "虚拟化仅渲染可见窗口加 overscan，使用业务 ID；动态高度要测量并维护滚动锚点。",
      "昂贵过滤考虑索引、缓存与 Worker；结果更新可设为非紧急，但输入 value 仍同步更新。",
      "将输入局部状态与大列表分离，确保 memo 子树的 props 稳定；服务端搜索单独做防抖、分页和竞态保护。",
      "在相同设备、相同数据与相同操作序列下比较，避免把开发 StrictMode 的额外检查当生产开销。",
    ],
    code: `// 固定行高虚拟窗口的核心计算，实际项目还需键盘导航和滚动处理。
const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
const end = Math.min(rows.length,
  Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
const visible = rows.slice(start, end);
const list = <div style={{ height: rows.length * rowHeight, position: 'relative' }}>
  <div style={{ position: 'absolute', top: start * rowHeight, width: '100%' }}>
    {visible.map(row => <Row key={row.id} row={row} />)}
  </div>
</div>;`,
    takeaway: "少提交 DOM、少计算数据与提高调度响应性，分别需要证据。",
    source: "https://react.dev/reference/react/Profiler",
  },
  {
    id: "q-context-broadcast",
    title: "一个字段更新导致全站刷新，Context 应如何拆分？",
    group: "性能与架构",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "AppContext 同时提供 user、theme、cart、searchText，每次输入都导致大量消费者重新渲染。Provider value 已经 useMemo，消费者也用了 memo。为什么仍然发生？",
      followUps: [
        "只订阅 cart.count 的组件是否仍会响应 cart 其他字段变化？",
        "什么时候拆 Context 足够，什么时候需要 selector 或外部 store？",
      ],
      checks: [
        "知道消费者订阅的是 Context 值，不是自动的字段级订阅",
        "将高频局部状态移出全局并按变化频率拆分",
        "区分稳定引用与精细订阅的能力边界",
      ],
    },
    summary:
      "只要 useMemo 的依赖发生变化，聚合 value 就会更新，所有订阅该 Context 的组件都可能响应。memo 不能屏蔽自身 Context 的更新。",
    points: [
      "searchText 能局部保存就不放全局；主题、用户与购物车按领域和更新频率拆开。",
      "可拆分状态 Context 与稳定的 dispatch Context，避免只派发动作的组件订阅整个状态。",
      "大量消费者需要字段级订阅时，再考虑带 selector 的状态方案，确保不可变快照与订阅一致性。",
    ],
    code: `const CartState = createContext(null);
const CartDispatch = createContext(null);
function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart);
  return <CartDispatch value={dispatch}>
    <CartState value={state}>{children}</CartState>
  </CartDispatch>;
}
// 只需要派发动作的组件读取 CartDispatch，不读取 CartState。`,
    takeaway:
      "useMemo 保持无变化时的引用，不会把一个 Context 自动变成字段订阅系统。",
    source: "https://react.dev/reference/react/useContext",
  },
  {
    id: "q-memo-comparator",
    title: "自定义 memo 比较器为何让点击读取旧数据？",
    group: "性能与架构",
    interview: {
      kind: "代码推演",
      difficulty: "高级",
      prompt:
        "列表卡片的比较器只比较 item.id。父级选中项和 price 变化后，卡片文字与点击行为都可能过期。解释忽略函数 prop 的风险，并给出修复次序。",
      questionCode: `const Card = memo(function Card({ item, onBuy }) {
  return <button onClick={onBuy}>{item.price}</button>;
}, (previous, next) => previous.item.id === next.item.id);`,
      followUps: [
        "深比较所有 props 是否一定更快、更可靠？",
        "把回调依赖写成 [] 能否让比较器忽略函数变得安全？",
      ],
      checks: [
        "自定义比较返回 true 意味着输出和行为都等价",
        "函数可能闭包捕获旧状态，不只是一个引用开销",
        "测量比较成本并优先修复数据边界",
      ],
    },
    summary:
      "比较器错误地把“同一商品”当作“输出与行为不变”。价格或回调闭包改变时，旧组件仍保留旧输出与旧事件。",
    points: [
      "优先移除不正确的比较器，用默认比较验证正确性，再根据测量决定优化。",
      "传入最少的原始 props，并仅在必要时用真实完整的依赖稳定回调。",
      "自定义比较必须覆盖影响渲染和行为的所有 props；深比较可能比渲染更昂贵，且不能修复被遗漏的闭包依赖。",
    ],
    code: `const Card = memo(function Card({ id, price, onBuy }) {
  return <button onClick={() => onBuy(id)}>{price}</button>;
});
const buy = useCallback(id => purchase(id, selectedAddress), [selectedAddress]);
return <Card id={item.id} price={item.price} onBuy={buy} />;`,
    takeaway: "错误的缓存会缓存错误；引用稳定不应以隐藏真实依赖为代价。",
    source: "https://react.dev/reference/react/memo",
  },
  {
    id: "q-effect-object-loop",
    title: "补齐对象依赖后 Effect 无限请求，应该删依赖吗？",
    group: "性能与架构",
    interview: {
      kind: "故障排查",
      difficulty: "进阶",
      prompt:
        "组件每次渲染创建 options = { roomId }，Effect 依赖 options 并 setState，形成循环。请解释引用变化链路，并比较把对象放到 Effect 内与用 useMemo 缓存的差别。",
      questionCode: `const options = { roomId };
useEffect(() => {
  setConnectionState({ options, connected: true });
}, [options]);`,
      followUps: [
        "如果 options 包含真正影响连接的 token，依赖该怎么写？",
        "没有外部系统，只为推导 filteredRows，还需要这个 Effect 吗？",
      ],
      checks: [
        "能列出 render → 新对象 → Effect → setState 的循环",
        "优先减少依赖结构，而不是关闭 lint",
        "区分外部同步与可在渲染时直接计算的数据",
      ],
    },
    summary:
      "每次创建新对象都让 Object.is 比较失败。把仅供 Effect 使用的对象移入 Effect，并依赖真正的原始输入，通常比额外缓存更清晰。",
    points: [
      "不要删掉 roomId、token 等真实依赖来强行停止循环。",
      "useMemo 可用于性能，但缓存不是连接正确性的永久保证；正确清理和重建必须安全。",
      "若 Effect 只是把 props 转换成另一个 state，应优先直接计算，消除额外更新链。",
    ],
    code: `useEffect(() => {
  const options = { roomId, token };
  const connection = createConnection(options);
  connection.connect();
  return () => connection.disconnect();
}, [roomId, token]);`,
    takeaway: "修复依赖问题通常要重构依赖的来源，而不是让依赖列表说谎。",
    source: "https://react.dev/learn/removing-effect-dependencies",
  },
  {
    id: "q-state-colocation",
    title: "每秒计时导致整页重渲染，如何避免满页 useCallback？",
    group: "性能与架构",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "页面顶层保存一个每秒更新的秒表，同时渲染大型报表和静态说明。请通过状态归属与组合优化，而不是给所有组件和函数加缓存。说明如何验证效果。",
      followUps: [
        "通过 children 传入已创建的子树，与在计时器组件内部重新创建有什么区别？",
        "报表自身订阅的 Context 更新时，还能跳过吗？",
      ],
      checks: [
        "将高频局部状态放到真正消费它的最小组件",
        "理解组件组合和元素引用对更新传播的影响",
        "用 Profiler 验证而非假设所有后代都很昂贵",
      ],
    },
    summary:
      "把计时状态下沉到 Clock，让更新范围与需求范围一致。父级无需随秒表一起执行，大报表也不必为了这次更新参与计算。",
    points: [
      "先处理过高的状态归属和不必要的全局订阅，再考虑 memo 边界。",
      "组合可把由外层创建的 children 交给局部有状态的壳，避免壳每次都创建昂贵子树。",
      "不同身份、state 与 Context 仍各自触发更新；不要把组合描述成永不渲染的绝对保证。",
    ],
    code: `function Clock() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <output>{seconds}</output>;
}
function Page() {
  return <><Clock /><ExpensiveReport /><StaticGuide /></>;
}`,
    takeaway: "合理限制状态更新的影响范围，常比批量增加缓存更有效。",
    source: "https://react.dev/learn/choosing-the-state-structure",
  },
  {
    id: "q-portal-events",
    title: "Modal 已 Portal 到 body，为什么仍触发行点击？",
    group: "性能与架构",
    interview: {
      kind: "故障排查",
      difficulty: "高级",
      prompt:
        "表格行有 onClick，行内部创建的 Modal Portal 到 document.body。点击弹窗按钮仍会触发行选择。解释 React 树和 DOM 树的差异，并比较 Portal 与独立 createRoot。",
      followUps: [
        "Portal 内还能读到原 Provider 的 Context 吗？",
        "改成独立 root 后，Context、事件边界和卸载由谁负责？",
      ],
      checks: [
        "React 事件按 React 树传播而非只看 DOM 祖先",
        "停止传播与移动组件所有权是不同修复方式",
        "认识独立 root 的生命周期和上下文隔离",
      ],
    },
    summary:
      "Portal 改变 DOM 落点，不改变 React 父子关系。事件仍可沿 React 树传播，Context 也仍来自原树。",
    points: [
      "可在弹窗合适边界停止传播，或把弹窗的 React 所有权移到表格行之外。",
      "遮罩点击关闭要区分 target 与 currentTarget，避免点击内部内容也关闭。",
      "独立 root 不会自动继承原 Provider，需要显式数据桥接和卸载；不要仅为绕过冒泡而随意增加 root。",
    ],
    code: `const modal = createPortal(
  <div onClick={event => {
    event.stopPropagation();
    if (event.target === event.currentTarget) onClose();
  }}>
    <section role="dialog" aria-modal="true" aria-label="详情">
      <button onClick={onClose}>关闭</button>
    </section>
  </div>, document.body
);
// 关键片段；完整弹窗还需焦点约束、Esc 处理与关闭后的焦点恢复。`,
    takeaway: "DOM 放在哪里和 React 中由谁拥有，是两个不同维度。",
    source: "https://react.dev/reference/react-dom/createPortal",
  },
];
