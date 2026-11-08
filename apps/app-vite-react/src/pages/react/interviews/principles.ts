import type { InterviewEntry } from "../types";

export const principleQuestions: InterviewEntry[] = [
  {
    id: "q-diff-heuristics",
    title: "React Diff 为什么快？相同 key 就一定复用吗？",
    group: "协调与 Diff",
    interview: {
      kind: "原理分析",
      difficulty: "进阶",
      prompt:
        "说明 React 如何通过同层比较、类型与 key 缩小搜索范围。下面切换 mode 时，Editor 的局部状态会保留吗？为什么不能把 O(n) 和“最少 DOM 操作”画等号？",
      questionCode: `// Editor 和 Preview 是两个不同的组件类型。
return mode === 'edit'
  ? <Editor key="article-1" />
  : <Preview key="article-1" />;`,
      followUps: [
        "如果始终渲染 Editor，只切换 mode prop，会如何影响局部状态？",
        "为什么把子组件移动到另一个父节点后，相同 key 也不能保留状态？",
      ],
      checks: [
        "说明 key 用于同级候选匹配，类型仍需兼容才能复用",
        "区分启发式协调、全局最优树编辑和整体渲染成本",
        "区分组件重渲染、状态保留和 DOM 变更",
      ],
    },
    summary:
      "切换时不保留 Editor 的局部状态。key 相同只说明同级候选身份匹配，Editor 与 Preview 类型不同，旧子树仍会卸载并替换。",
    points: [
      "React 基于不同类型通常产生不同子树、开发者提供稳定 key 等假设，避免搜索任意节点之间的最优对应关系。",
      "同一父级、相同类型与稳定 key 允许复用状态，但更新 props 后仍可能执行组件函数并继续协调子节点。",
      "同层线性扫描的思路不承诺全局最少移动；组件计算、嵌套子树、提交和浏览器绘制仍会产生其他成本。",
      "需要跨模式保留草稿时，可保持 Editor 的类型与位置，或将草稿提升到覆盖两个模式的父组件。",
    ],
    code: `// 同一父级与位置，类型和 key 始终相同。
// Editor 自己根据 mode 决定呈现编辑器还是预览。
<Editor key="article-1" mode={mode} />

// 如果必须使用两个不同组件，则把需要保留的草稿提升。
const [draft, setDraft] = useState('');
const content = mode === 'edit'
  ? <Editor value={draft} onChange={setDraft} />
  : <Preview value={draft} />;`,
    takeaway:
      "回答“是否复用”时要同时检查父级位置、key 和类型，而不是只看 key。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "q-diff-placement",
    title: "A B C D 变为 D A B C，哪些节点被标记移动？",
    group: "协调与 Diff",
    interview: {
      kind: "代码推演",
      difficulty: "高级",
      prompt:
        "按 React 19.2 普通 keyed 数组协调路径推演：同级 Row 从 A B C D 变为 D A B C，类型相同、key 稳定。说明 Map 的作用、lastPlacedIndex 的变化，以及为何可能标记三次移动。",
      questionCode: `// Row 均返回一个 li；字母既是业务 ID，也是 key。
const before = ['A', 'B', 'C', 'D'];
const after = ['D', 'A', 'B', 'C'];
return after.map(id => <Row key={id} id={id} />);`,
      followUps: [
        "A B C 变为 A C E 时，复用、插入和删除分别是什么？",
        "Placement 标记是否必然表示新组件挂载？",
      ],
      checks: [
        "指出首项失配后为剩余旧节点建 Map",
        "按旧索引说明 D 无移动标记，A、B、C 标记移动",
        "理解复用移动保留状态，且该策略不求最少移动",
      ],
    },
    summary:
      "四个 Row 都可复用。D 的旧索引为 3，将 lastPlacedIndex 提升到 3；随后 A、B、C 的旧索引均小于 3，因此被标记 Placement，表示移动已有节点。",
    points: [
      "初次比较 A 与 D 的 key 不同，进入 Map 查找路径；每次复用成功就从待删除的旧节点集合中移除该项。",
      "lastPlacedIndex 起始为 0，D 使其变成 3，此后保持 3；标记决策与实际 DOM 操作发生在不同阶段。",
      "提交可以通过依次将 A、B、C 放到末尾得到 D A B C。手工先移动 D 一次也能达到相同结果，说明该算法并不保证最少移动。",
      "对 A B C → A C E，A 与 C 复用，B 删除，E 插入；C 的旧索引递增，无需移动标记。",
    ],
    code: `// 用注释模拟 placeChild 的关键决策，并非可替换源码。
// 节点  oldIndex  lastPlacedIndex  标记
// D     3         0 → 3            无移动标记
// A     0         3                Placement（移动）
// B     1         3                Placement（移动）
// C     2         3                Placement（移动）

// 插入新节点：没有可复用的旧 Fiber，也会设置 Placement。
// 剩余未匹配的旧节点：加入删除列表。
// 移动已有 Fiber 不会仅因移动而重置其 useState。`,
    takeaway:
      "这是特定版本源码路径的推演，不能把移动标记数量当成 React 对业务代码的长期 API 保证。",
    source:
      "https://github.com/facebook/react/blob/v19.2.0/packages/react-reconciler/src/ReactChildFiber.js",
  },
  {
    id: "q-diff-index-key",
    title: "用 index 作 key，删除首行后草稿为什么串行？",
    group: "协调与 Diff",
    interview: {
      kind: "代码推演",
      difficulty: "进阶",
      prompt:
        "初始有 Alice、Bob、Carol 三行。每个 Row 用 useState 保存自己的草稿，用户把 Bob 的草稿改成 B* 后删除 Alice。使用 index key 时，剩余两行的姓名和草稿会怎样对应？",
      questionCode: `function Row({ user }) {
  const [draft, setDraft] = useState(user.name);
  return <label>{user.name}
    <input value={draft} onChange={e => setDraft(e.target.value)} />
  </label>;
}
return users.map((user, index) => <Row key={index} user={user} />);`,
      followUps: [
        "换成 Math.random() 为什么会从串行变成每次丢失输入？",
        "完全静态、不会排序增删且没有行内状态的列表，使用 index 有何边界？",
      ],
      checks: [
        "推导 key 0 复用原 Alice 状态，key 1 复用原 Bob 状态",
        "知道 useState 初始值不会在 props 更新时重新初始化",
        "选择稳定业务 ID，区分身份修复与同步 props 的补丁",
      ],
    },
    summary:
      "删除后 key 0 的 Row 接收 Bob 的 props，却保留 Alice 的草稿；key 1 的 Row 接收 Carol 的 props，却保留 B*。原 key 2 的 Carol Row 被卸载。",
    points: [
      "React 按位置身份复用完全符合 index key 的含义；业务姓名变化不会自动重置 useState。",
      "用 user.id 作 key，才能让 Bob 的 B* 跟随 Bob；不要靠每次 props 更新就覆盖草稿的 Effect 掩盖身份问题。",
      "随机 key 每次渲染都变化，导致旧行卸载、新行挂载，状态和输入焦点均可能丢失。",
      "静态列表可评估 index 的成本与边界，一旦会插入、删除、排序或有组件局部状态，就优先使用稳定业务身份。",
    ],
    code: `// 正确的业务身份跟随用户，而不是跟随第几行。
return users.map(user => <Row key={user.id} user={user} />);

// 初始：Alice / Alice，Bob / B*，Carol / Carol
// index key 删除 Alice 后：Bob / Alice，Carol / B*
// ID key 删除 Alice 后：Bob / B*，Carol / Carol`,
    takeaway: "key 不是仅用于消除控制台警告，它决定局部状态属于哪一个身份。",
    source:
      "https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key",
  },
  {
    id: "q-fiber-interruption",
    title: "Fiber 能中断渲染，为什么 200ms 的组件仍会阻塞输入？",
    group: "Fiber 与调度",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "团队认为有了 Fiber，任意耗时组件都能在执行途中被 React 暂停。请区分 element、Fiber、DOM，解释 current / workInProgress，以及为什么长同步循环仍然卡顿。",
      followUps: [
        "低优先级 render 被丢弃时，已显示 DOM 会被回滚到一半吗？",
        "把耗时函数直接放到 startTransition 回调里，为什么仍会阻塞？",
      ],
      checks: [
        "解释 Fiber 保存状态、树关系和待处理工作",
        "指出让出发生在可调度工作单元之间，不是抢占任意 JS 指令",
        "区分可中断 render、同步提交和浏览器绘制",
      ],
    },
    summary:
      "Fiber 支持把渲染工作拆分并在单元之间协作让出主线程；一个尚未返回的组件函数仍是同步 JavaScript，React 不能抢占其中的 200ms 循环。",
    points: [
      "element 是 UI 描述；Fiber 是有状态的工作单元；DOM 是浏览器宿主节点，三者不是同一棵对象树。",
      "current 保留已提交结果，workInProgress 准备下一版；render 可重算或丢弃，未提交结果不会逐片暴露给用户。",
      "commit 同步应用本轮 DOM 修改与布局工作。大规模 DOM 提交仍然可能耗时，不能只优化 render。",
      "拆分组件让 React 有更多调度边界；减少计算、缓存合适结果、虚拟化大列表，或把纯 CPU 工作移到 Worker，才处理计算量本身。",
    ],
    code: `// startTransition 回调会立刻执行；不能把它当成 Worker。
startTransition(() => {
  const result = expensiveCalculate(data); // 此处仍同步阻塞主线程。
  setResult(result);
});

// 重 CPU 任务可用已有 Worker 计算，再把结果交回 React。
worker.onmessage = event => {
  const result = event.data;
  startTransition(() => setResult(result));
};
worker.postMessage(data);`,
    takeaway:
      "并发解决工作安排和响应顺序；减少计算量、拆分工作与减少 DOM 数量仍需单独设计。",
    source:
      "https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react",
  },
  {
    id: "q-setstate-sync-async",
    title: "setState 到底同步还是异步？await setter 能等到提交吗？",
    group: "更新与批处理",
    interview: {
      kind: "代码推演",
      difficulty: "进阶",
      prompt:
        "React 19 createRoot，count 初始为 0，只点击一次。解释两条日志为什么都不是 1。再说明类组件如何在提交后读取 this.state，以及为什么不能用一句“setState 是异步的”结束回答。",
      questionCode: `async function handleClick() {
  setCount(count + 1);
  console.log('A', count);
  await setCount(n => n + 1);
  console.log('B', count);
}`,
      followUps: [
        "如果 DOM 此时已更新，为什么 B 仍然可能读取旧值？",
        "setTimeout 内观察类组件 this.state，React 17 和 React 18 createRoot 有何不同？",
      ],
      checks: [
        "明确 A、B 都为 0，正常完成后 UI 为 2",
        "知道 setter 返回 undefined，await 不等待 React 提交",
        "分清同步调用、闭包快照与调度提交，并给出类组件回调方案",
      ],
    },
    summary:
      "A 和 B 都是 0，最终 UI 为 2。两个 setter 都在 await 真正让出前被调用并排队；await 等待的是 undefined，续体仍持有 count 为 0 的旧闭包。",
    points: [
      "第一次替换为 1，第二次函数更新把队列结果增加到 2；不能根据 B 的日志推断 DOM 一定未提交。",
      "调用 setter 同步发出更新请求；新状态何时计算并提交取决于调度，当前局部变量始终属于原快照。",
      "类组件可用 this.setState(updater, callback) 或 componentDidUpdate 观察提交；Hook 没有第二个提交回调参数。",
      "旧版非批处理场景曾可立即观察到类实例状态变化，现代自动批处理扩大后该经验不可靠，面试必须交代版本和根 API。",
    ],
    code: `// 类组件：读取提交后的状态。
this.setState(
  previous => ({ count: previous.count + 1 }),
  () => console.log('已提交：', this.state.count)
);

// 函数组件：需要与提交后的外部系统同步时使用 Effect。
useEffect(() => {
  console.log('本次提交的 count：', count);
}, [count]);
// 若仅需在事件中使用下一值，可以先计算 nextCount 再传给 setter。`,
    takeaway:
      "“异步”只是提交可能稍后发生的通俗描述，不代表 setter 是 Promise 或会修改旧闭包。",
    source:
      "https://react.dev/reference/react/useState#ive-updated-the-state-but-logging-gives-me-the-old-value",
  },
  {
    id: "q-batching-versions",
    title: "计时器里的两次更新，React 17、18、19 有何区别？",
    group: "更新与批处理",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "在普通页面中点击按钮，启动一个计时器；回调依次更新 count 和 flag。假设更新值确实变化，且无 StrictMode、Suspense、Transition 和 flushSync。比较 React 17 legacy root、React 18 legacy root 与 createRoot、React 19 createRoot 的默认批处理行为。",
      questionCode: `setTimeout(() => {
  setCount(n => n + 1);
  setFlag(value => !value);
}, 100);`,
      followUps: [
        "把计时器改成 Promise.then 或原生 addEventListener 呢？",
        "为什么连续两次用户点击通常不合成同一批次？",
      ],
      checks: [
        "旧根默认不批处理该计时器中的两次更新，现代根自动批处理",
        "知道 React 18 是否切换 createRoot 是关键，React 19 移除了旧根 API",
        "区分批次、提交和开发环境组件调用次数",
      ],
    },
    summary:
      "在题设条件下，React 17 与 React 18 的 legacy root 默认分别处理两次更新；React 18 createRoot、React 19 createRoot 会把该回调中的更新自动批处理，通常合为一次提交。",
    points: [
      "React 17 默认已批处理 React 事件处理器内的更新，不能说“React 18 才开始有批处理”。",
      "React 18 createRoot 将范围扩展到 Promise、计时器和原生事件等；React 18 继续使用 ReactDOM.render 则保留旧行为。",
      "React 19 已移除 ReactDOM.render，不能在 React 19 应用中用旧入口复现 legacy root 行为。",
      "不同用户事件之间保留安全边界；自动批处理也不是承诺整条异步业务链只提交一次。",
    ],
    code: `// 历史行为比较；不是在同一应用中同时创建四个根。
// React 17 + ReactDOM.render：计时器内默认不合批。
// React 18 + ReactDOM.render：沿用 legacy 行为。
// React 18 + createRoot：计时器内自动合批。
// React 19 + createRoot：计时器内自动合批，旧 render API 已移除。

// 现代项目入口：
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);`,
    takeaway:
      "限定条件后再讨论典型提交次数；实际排查以 Profiler 的提交记录为准，别只数 render 日志。",
    source:
      "https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching",
  },
  {
    id: "q-batching-await-boundary",
    title: "async 事件有 await，所有更新都在同一批次吗？",
    group: "更新与批处理",
    interview: {
      kind: "代码推演",
      difficulty: "高级",
      prompt:
        "React 19 createRoot，save 返回稍后才完成的网络 Promise。解释等待期间和完成后的状态、哪些更新可合批，以及为什么 await 后读取的 count 仍可能过期。不要仅凭源码行数断言固定渲染次数。",
      questionCode: `// 初始 busy=false、count=0；无其他操作，save 成功。
async function handleSave() {
  setBusy(true);
  setCount(n => n + 1);
  await save();
  setBusy(false);
  setCount(n => n + 1);
  console.log(count);
}`,
      followUps: [
        "等待期间用户又操作一次，函数式更新与 count + 1 有什么差异？",
        "如果 save 失败，要如何保证 busy 正确恢复？",
      ],
      checks: [
        "识别 await 前后是不同执行段，不能假定跨越网络等待仍属于一批",
        "推导等待中 busy=true/count=1，成功后 busy=false/count=2",
        "指出完成段日志仍为 0，并考虑错误处理与重复提交",
      ],
    },
    summary:
      "网络等待允许前半段先提交，通常可看到 busy=true、count=1；请求完成后的两个更新可在续体内合批，最终 busy=false、count=2。日志仍是本次处理器捕获的 0。",
    points: [
      "自动批处理涵盖异步回调内部的多次更新，不等于跨任意 await 和网络等待合并整次操作。",
      "两个函数更新都从各自被处理时的队列状态计算，因此在题设下总计加 2；直接使用旧 count 则可能覆盖等待期间的新更新。",
      "出错时用 try/catch/finally 恢复界面；若允许并发保存，还需请求标识或活动请求计数，防止旧请求结束时错误清除新请求的 busy。",
    ],
    code: `// 下面按同一时刻仅允许一次保存来设计。
async function handleSave() {
  setBusy(true);
  try {
    await save();
    setCount(n => n + 1);
    setError(null);
  } catch (error) {
    setError(error);
  } finally {
    setBusy(false);
  }
}
// UI 禁用按钮只是交互措施；真实写入仍需服务端保障幂等性。`,
    takeaway:
      "批次边界不等于业务事务边界；状态快照也不会因为 await 而自动刷新。",
    source: "https://react.dev/learn/state-as-a-snapshot",
  },
  {
    id: "q-flush-sync-snapshot",
    title: "flushSync 后 DOM 是新值，为什么变量仍是旧值？",
    group: "更新与批处理",
    interview: {
      kind: "代码推演",
      difficulty: "高级",
      prompt:
        "count 初始为 0，以下处理器用于一个已挂载的计数器；spanRef 指向显示 count 的 span。只点击一次，A 和 B 分别是什么？如果目标只是测量更新后的布局，是否一定需要 flushSync？",
      questionCode: `function handleClick() {
  flushSync(() => setCount(n => n + 1));
  console.log('A', count);
  console.log('B', spanRef.current.textContent);
}
// JSX：<span ref={spanRef}>{count}</span>`,
      followUps: [
        "连续两段 flushSync 为什么可能让中间状态也被提交？",
        "它可能影响回调以外的更新或 Suspense 吗？",
      ],
      checks: [
        "推导 A 为数字 0、B 为字符串 '1'",
        "说明同步提交不会修改旧闭包",
        "能选择布局 Effect，并说明强制刷新的成本和范围",
      ],
    },
    summary:
      "A 是数字 0，B 是字符串 '1'。flushSync 返回前 DOM 已反映新提交，但当前 handleClick 中的 count 是旧渲染创建的局部变量。",
    points: [
      "DOM ref 指向的节点可被提交阶段更新；读取节点内容和读取旧快照变量是两个不同观察渠道。",
      "只需在 DOM 更新后、浏览器绘制前测量时，useLayoutEffect 通常足够；必须让第三方同步接口在下一行拿到新 DOM 时才考虑 flushSync。",
      "flushSync 可能处理回调外必要的待完成工作，也可能触发 Effect 或显示 Suspense fallback，频繁使用会破坏批处理收益。",
    ],
    code: `// 一般的提交后布局测量，不需要强制刷新。
const spanRef = useRef(null);
useLayoutEffect(() => {
  const rect = spanRef.current.getBoundingClientRect();
  console.log('已提交的 count 与宽度：', count, rect.width);
}, [count]);
// 在事件中正常 setCount(n => n + 1)。`,
    takeaway:
      "需要立即读取 DOM 的集成场景与需要取得下一状态值的计算场景，应分别处理。",
    source: "https://react.dev/reference/react-dom/flushSync",
  },
  {
    id: "q-class-hook-merge",
    title: "类 setState 与 useState 更新对象，为什么结果不同？",
    group: "更新与批处理",
    interview: {
      kind: "代码推演",
      difficulty: "进阶",
      prompt:
        "两个组件初始状态都为 { count: 0, name: 'Lin' }，同一次 React 事件中连续执行下面的更新。分别推导最终状态，解释批处理为什么不会让 Hook setter 自动浅合并对象。",
      questionCode: `// 类组件：
this.setState({ count: 1 });
this.setState({ name: 'Chen' });

// 函数组件，同一个 useState 对象（JavaScript 示例）：
setProfile({ count: 1 });
setProfile({ name: 'Chen' });`,
      followUps: [
        "类组件浅合并能否自动保留嵌套对象里的其他字段？",
        "严格 TypeScript 对完整对象类型的缺字段更新会提供什么帮助？",
      ],
      checks: [
        "类组件结果为 { count: 1, name: 'Chen' }，Hook 结果仅有 name",
        "区分浅合并与替换，不能用批处理解释对象结构",
        "用纯函数更新和对象展开保留其他字段",
      ],
    },
    summary:
      "类 setState 浅合并每项对象，最终为 { count: 1, name: 'Chen' }；Hook setter 逐项替换整个状态，最终仅为 { name: 'Chen' }。这是 API 语义差异，与是否批处理无关。",
    points: [
      "Hook 的第二次对象更新覆盖第一次结果；显式展开前一状态，才能保留 count 等其他字段。",
      "类组件也只是顶层浅合并。更新嵌套 address 时仍需复制 address 中想保留的字段，不会递归合并。",
      "依赖前一次更新时，使用 previous => 新状态，避免展开旧闭包对象而覆盖队列中刚产生的结果。",
    ],
    code: `// Hook：两次都基于队列中的前一状态构造完整对象。
setProfile(previous => ({ ...previous, count: 1 }));
setProfile(previous => ({ ...previous, name: 'Chen' }));
// 最终 { count: 1, name: 'Chen' }

// 嵌套更新同样需要逐层复制。
setProfile(previous => ({
  ...previous,
  address: { ...previous.address, city: 'Shanghai' },
}));`,
    takeaway:
      "类组件浅合并，Hook 替换整个值；两者都不支持依靠原地修改来表达可靠更新。",
    source: "https://react.dev/reference/react/Component#setstate",
  },
  {
    id: "q-lane-rebase",
    title: "低优先级 +10，高优先级 ×2，稍后重放会得到多少？",
    group: "Fiber 与调度",
    interview: {
      kind: "代码推演",
      difficulty: "专家",
      prompt:
        "count 初始为 1。同一次点击先排入 Transition 的 +10，再排入紧急的 ×2。假设紧急更新先提交，Transition 随后完成，期间无其他更新。解释紧急结果、最终结果与跳过更新后的队列重放。",
      questionCode: `startTransition(() => {
  setCount(n => n + 10);
});
setCount(n => n * 2);`,
      followUps: [
        "为什么不能拿紧急提交的 2 再加 10，直接得到 12？",
        "如果 ×2 改成固定值 setCount(count * 2)，最终结果会怎样？",
      ],
      checks: [
        "紧急阶段跳过 +10，得到 2；随后按原队列语义重放得到 22",
        "理解保留基线与重放后续更新，而不是丢弃或乱序应用",
        "固定值替换最终为 2，并指出 updater 必须纯净",
      ],
    },
    summary:
      "紧急阶段可以先显示 2；稍后恢复低优先级队列时，从跳过更新前的基线 1 处理 +10，并重放后续 ×2，最终为 22，不是 12。",
    points: [
      "低优先级更新不会因为本轮跳过就被删除；为保持原队列计算语义，跳过点之后已处理的后续更新也需要留有可重放的记录。",
      "最终逻辑顺序仍然是 (1 + 10) × 2；调度改变的是哪些结果先提交，不是随意改变函数更新的组合顺序。",
      "若最后一项是 setCount(count * 2)，闭包先计算出的固定值是 2，重放到该项时会替换此前结果，最终仍为 2。",
      "这个例子采用题设的先后提交条件；实际中间提交次数取决于调度。updater 可能重放，因此不能在其中埋点、下单或累加外部变量。",
    ],
    code: `// 学习用队列推演：
// 原队列：[Transition: n => n + 10, 紧急: n => n * 2]
// 紧急轮：基线 1 → 跳过 +10 → ×2 → 提交 2
// 后续轮：基线 1 → +10 = 11 → 重放 ×2 = 22

// 固定值替换变体：
// 原队列：[Transition: n => n + 10, 紧急: 替换为 2]
// 后续轮：基线 1 → +10 = 11 → 替换为 2
// 不要在 updater 内执行副作用来统计“实际更新次数”。`,
    takeaway:
      "Lanes 允许不同优先级分轮处理；base state 与保留队列让最终状态仍符合更新的逻辑顺序。",
    source:
      "https://github.com/facebook/react/blob/v19.2.0/packages/react-reconciler/src/ReactFiberHooks.js",
  },
  {
    id: "q-hook-call-order",
    title: "Hooks 为什么依赖调用顺序？use 也不能放条件里吗？",
    group: "Hooks 与副作用",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "visible 从 true 变成 false 时，下面组件违反了什么规则？解释状态实际关联到哪里、React 是否按变量名识别 Hook，并说明 React 19 use API 与常规 Hook 的区别。",
      questionCode: `function Panel({ visible }) {
  const [name, setName] = useState('Lin');
  if (!visible) return null;
  const [age, setAge] = useState(18);
  return <p>{name} / {age}</p>;
}`,
      followUps: [
        "两次调用同一个自定义 Hook，是否共用一份状态？",
        "把 age 移到仅在 visible 时挂载的独立子组件，生命周期会怎样变化？",
      ],
      checks: [
        "指出提前返回导致同一组件不同渲染的常规 Hook 数量不一致",
        "解释 Fiber 上的 Hook 记录与顺序匹配，而不是变量名匹配",
        "知道 use 可在条件与循环调用，但仍有调用上下文和 try/catch 限制",
      ],
    },
    summary:
      "visible 为 true 时调用两个 useState，为 false 时只调用一个，破坏同一组件的 Hook 调用顺序。React 通过对应 Fiber 上按顺序关联的记录保存状态，不读取变量名识别 Hook。",
    points: [
      "将所有常规 Hook 放在条件返回之前；需要条件订阅时，在 Effect 的 setup 内判断，保持调用序列稳定。",
      "自定义 Hook 的内部调用也计入当前组件的序列；共享的是逻辑，每个调用位置的状态独立。",
      "拆出条件子组件也合法，但隐藏时卸载会丢失其局部状态，是否可接受由需求决定。",
      "React 19 的 use 可以在条件和循环中读取资源；仍只能在组件或 Hook 中调用，不能用 try/catch 包住它来处理挂起。",
    ],
    code: `function Panel({ visible }) {
  const [name, setName] = useState('Lin');
  const [age, setAge] = useState(18);
  // 所有常规 Hook 调用完成后再决定是否返回 UI。
  if (!visible) return null;
  return <>
    <input aria-label="姓名" value={name}
      onChange={event => setName(event.target.value)} />
    <button onClick={() => setAge(n => n + 1)}>{age}</button>
  </>;
}`,
    takeaway:
      "“所有名字以 use 开头的 API 都不能有条件调用”在 React 19 中不够准确，需说明 use 的特例。",
    source: "https://react.dev/reference/rules/rules-of-hooks",
  },
  {
    id: "q-effect-commit-order",
    title: "render、布局 Effect、普通 Effect 与绘制如何排序？",
    group: "Hooks 与副作用",
    interview: {
      kind: "原理分析",
      difficulty: "高级",
      prompt:
        "组件记录 render、useLayoutEffect setup/cleanup、useEffect setup/cleanup。说明哪些先后关系可以依赖，为什么“useEffect 永远在绘制后”和“cleanup 只在卸载时执行”都不准确，并解释未提交的并发渲染是否运行 Effect。",
      followUps: [
        "useLayoutEffect 中触发状态更新，为什么可能影响普通 Effect 的执行时机？",
        "StrictMode 的额外 setup / cleanup 应如何处理，而不是用 ref 屏蔽第二次执行？",
      ],
      checks: [
        "区分 render 计算、DOM 提交、布局 Effect 和浏览器绘制",
        "给出同一 Effect 旧 cleanup 在新 setup 前的保证",
        "不承诺普通 Effect 总在绘制后，知道未提交 render 不执行对应 setup",
      ],
    },
    summary:
      "成功渲染后才能提交；DOM 更新后布局 Effect 在重绘前执行。普通 Effect 通常不阻塞绘制，但交互和布局更新可能让它提前。依赖变化时，同一 Effect 先清理旧订阅，再建立新订阅。",
    points: [
      "render 可能重试或丢弃，因此不得包含依赖“只运行一次”的副作用；被丢弃的新渲染不会执行自己的 Effect setup。",
      "依赖从 A 变为 B 时，旧 cleanup 捕获 A，新 setup 捕获 B；这不是只有卸载才需要的清理。",
      "useLayoutEffect 的同步工作会阻塞绘制；其中的更新可能使 React 立即执行剩余 Effect，不能把普通 Effect 作为“屏幕已画完”的通知。",
      "开发 StrictMode 的额外检查要求 setup 与 cleanup 对称；全局日志还会受父子树、更新来源和任务调度影响，不应背诵一个通用固定序列。",
    ],
    code: `// connectionFactory 是模块级稳定工厂，返回支持 connect/disconnect 的连接。
function Room({ roomId }) {
  useEffect(() => {
    const connection = connectionFactory(roomId);
    connection.connect();
    console.log('setup', roomId);
    return () => {
      connection.disconnect();
      console.log('cleanup', roomId);
    };
  }, [roomId]);
  return <p>房间：{roomId}</p>;
}
// A → B：同一 Effect 的 cleanup(A) 先于 setup(B)。`,
    takeaway:
      "可靠的时序来自生命周期保证，不能依靠某一次 console、计时器与绘制日志的偶然排列。",
    source: "https://react.dev/reference/react/useEffect",
  },
];
