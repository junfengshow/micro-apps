import type { InterviewEntry } from "../types";

export const scenarioQuestions: InterviewEntry[] = [
  {
    id: "q-autosave",
    title: "自动保存：旧响应覆盖新输入，客户端和服务端各怎么防？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "编辑器每停顿 800ms 自动保存。用户连续修改两次，第一次保存慢、第二次快；刷新后服务端却是旧内容。要求保留继续输入、展示保存状态、断网重试并避免多端覆盖。",
      followUps: [
        "只忽略旧响应，是否能阻止服务端最终被旧请求覆盖？",
        "相同版本冲突后，应该自动重试覆盖还是让用户合并？",
      ],
      checks: [
        "区分 UI 响应乱序和服务端写入乱序",
        "提交快照携带 revision / version，服务端执行条件写入",
        "保存成功只确认对应快照，不能清掉后续输入的 dirty 状态",
      ],
    },
    summary:
      "客户端忽略旧响应只解决展示问题。写入顺序需要服务端版本校验或串行保存协议；编辑状态与已确认快照必须分开。",
    points: [
      "输入维护本地 revision；发请求时捕获 draft 和 revision，成功后只确认该 revision。",
      "简单方案是单请求在途并合并后续待保存草稿；多端场景仍需 ETag / version 条件更新。",
      "请求超时可能已写入，重试要有幂等键；409 / 412 等冲突进入明确的合并流程。",
      "离开页面时提示未保存内容；不要把 beforeunload 当作可靠的最终保存通道。",
    ],
    code: `// 保存协议关键片段：版本校验必须由服务端原子执行。
async function saveSnapshot(snapshot, version, mutationId) {
  const response = await fetch('/api/document', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json',
      'If-Match': version, 'Idempotency-Key': mutationId },
    body: JSON.stringify(snapshot),
  });
  if ([409, 412].includes(response.status)) throw new Error('版本冲突，需合并');
  if (!response.ok) throw new Error('保存失败');
  return { data: await response.json(), version: response.headers.get('ETag') };
}`,
    takeaway: "忽略过期 setState，不等于保证远端数据不会被过期写入。",
    source: "https://react.dev/learn/state-as-a-snapshot",
  },
  {
    id: "q-optimistic-races",
    title: "连续点赞与取消点赞，如何避免失败回滚抹掉新操作？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "用户先点赞、再取消，两个请求乱序完成，第一个最终失败。直接 setState(previousSnapshot) 回滚会覆盖第二个操作。设计乐观状态、请求协议与失败反馈。",
      followUps: [
        "useOptimistic 会自动解决服务端写入乱序吗？",
        "服务端返回聚合点赞数时，怎样处理其他用户带来的版本更新？",
      ],
      checks: [
        "按 mutationId 跟踪操作，而不是保存一个全局旧快照",
        "在最新已确认基线上重放仍有效的待确认意图",
        "选择串行、合并最终意图或带版本的写入协议",
      ],
    },
    summary:
      "用已确认基线加待处理操作描述乐观状态。失败时只移除对应操作，再从最新基线重算，避免整份旧快照覆盖后续行为。",
    points: [
      "toggle 类操作常可改为带明确目标值的幂等 setLiked(true / false)，并按实体串行或只发送最新意图。",
      "useOptimistic 提供 Action 期间的临时视图，不保证请求排序、服务端幂等或跨设备一致性。",
      "响应携带实体版本与 mutationId；旧版本不能覆盖新基线，失败只影响对应意图。",
      "UI 区分待确认与失败，并提供重试；必要时短暂限制重复操作，明确这种产品取舍。",
    ],
    code: `// 乐观队列模型示意；网络确认和版本排序由数据层负责。
const view = pending.reduce(
  (state, operation) => ({ ...state, liked: operation.target }), confirmed
);
function reject(mutationId) {
  setPending(items => items.filter(item => item.id !== mutationId));
}
function enqueue(target) {
  setPending(items => [...items, { id: crypto.randomUUID(), target }]);
}
// 不能使用 setConfirmed(提交前的整份快照) 回滚所有操作。`,
    takeaway: "回滚的单位应是操作，而不是覆盖整个世界的旧快照。",
    source: "https://react.dev/reference/react/useOptimistic",
  },
  {
    id: "q-async-validation",
    title: "用户名异步校验通过后，提交时却不是同一个值？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "高级",
      prompt:
        "用户名 blur 后查询是否可用；请求尚未完成用户又改名，旧结果显示绿色并允许提交。要求输入法友好、防抖、取消、错误区分，并说明服务端仍需做什么。",
      followUps: [
        "网络错误能显示成“用户名已存在”吗？",
        "校验后别的用户抢先注册，前端如何保持正确？",
      ],
      checks: [
        "校验结果关联具体规范化值与请求序号",
        "未校验、校验中、不可用、网络错误状态分开",
        "提交端执行权威唯一性约束，不把前置查询当锁",
      ],
    },
    summary:
      "校验状态必须带上它所校验的 value；只有结果对应当前规范化输入时，才能展示为当前值的有效结论。前置校验只改善体验。",
    points: [
      "按产品规则规范化输入，防抖后请求，清理旧请求并拒绝过期结果。",
      "输入改变立即让旧校验失效；组合输入期间避免破坏输入过程，提交时检查最终 FormData。",
      "服务端注册事务内执行唯一约束并返回字段错误；网络错误单独提示可重试。",
    ],
    code: `// 更新校验结果时记录值；序号与 AbortController 由请求层维护。
setValidation({ value: normalized, status: 'valid' });
const currentIsValid = validation.value === normalize(name)
  && validation.status === 'valid';
// 提交不能只信 currentIsValid，服务端必须再次校验并原子写入。
<button disabled={!currentIsValid || submitting}>注册</button>;`,
    takeaway: "“曾经校验通过”不等于“当前提交仍然有效”。",
    source: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "q-large-form-ime",
    title: "500 字段表单如何兼顾性能、联动与中文输入？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "后台配置页有 500 个字段，顶层一个 values 对象控制所有输入；每次输入全表校验且格式化字符串，中文输入法会丢字。给出状态、订阅、校验和输入处理方案。",
      followUps: [
        "把所有输入改成非受控，跨字段联动会不会自动解决？",
        "需要虚拟化字段时，未挂载字段的值和错误保存在何处？",
      ],
      checks: [
        "按字段或领域精细订阅，避免每键触发全表计算",
        "实时输入与格式化、异步校验分离",
        "保留组合输入和光标，不以缓存掩盖架构问题",
      ],
    },
    summary:
      "按字段组织订阅，将联动集中为明确依赖；局部即时更新，昂贵校验按 blur / submit 或防抖执行。中文组合输入期间不要强制改写文本。",
    points: [
      "选择受控、非受控或表单 store 要基于交互需要，核心是避免所有字段订阅整份高频 values。",
      "用 compositionstart / compositionend 区分组合输入，格式化可移至 blur，避免每键改写导致光标跳动。",
      "联动更新应保持领域不变量；错误、dirty、touched 独立管理，依赖字段有变再校验。",
      "虚拟化只减少 DOM，不负责持久化表单值；卸载字段的数据由外部表单状态保存。",
    ],
    code: `const composing = useRef(false);
<input value={value}
  onCompositionStart={() => { composing.current = true; }}
  onCompositionEnd={event => {
    composing.current = false;
    validateLater(event.currentTarget.value);
  }}
  onChange={event => {
    const next = event.target.value;
    setValue(next); // 立即保留原始输入，不在此强制格式化。
    if (!composing.current) validateLater(next);
  }}
  onBlur={() => commitFormattedValue(value)} />;`,
    takeaway: "减少订阅范围解决性能，尊重输入过程解决体验，两者都要设计。",
    source: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "q-infinite-pagination",
    title: "筛选与无限滚动同时发生，怎样防串页、漏页和重复行？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "用户在第 3 页加载中切换筛选条件，旧页返回后被追加进新列表。IntersectionObserver 又触发多次加载，产生重复行。请设计查询身份、游标、请求锁和状态转换。",
      followUps: [
        "只按 row.id 去重是否会掩盖游标协议错误？",
        "数据实时新增时，offset 与 cursor 分页分别有什么风险？",
      ],
      checks: [
        "查询身份包含筛选、排序和必要的权限范围",
        "按 queryKey + cursor 去重在途请求并拒绝旧查询结果",
        "终止条件、失败重试和顺序有明确规则",
      ],
    },
    summary:
      "把一次查询会话作为数据身份，分页响应只能追加到同一会话；游标、在途请求和是否还有下一页由数据层维护。",
    points: [
      "筛选改变时更换 queryKey 并重置游标；旧请求即使无法取消，也不能写入新会话。",
      "同一 cursor 只能有一个在途请求；observer 只是触发来源，不能充当请求锁。",
      "服务端排序需稳定，cursor 可包含排序字段和唯一 ID；客户端去重是防护，不是正确分页的替代。",
      "错误保留已成功页并重试失败游标；避免翻页失败时错误地把 hasMore 设为 false。",
    ],
    code: `// 响应归属检查：requestKey 来自发起请求时捕获的查询会话。
setList(current => {
  if (current.queryKey !== requestKey) return current;
  const merged = new Map(current.items.map(item => [item.id, item]));
  page.items.forEach(item => merged.set(item.id, item));
  return { ...current, items: [...merged.values()],
    nextCursor: page.nextCursor, status: 'success' };
});
// 还需在请求层对 queryKey + cursor 去重，保证页追加顺序。`,
    takeaway: "分页数据不只是数组，还属于一个带身份与顺序的查询会话。",
    source: "https://react.dev/reference/react/useEffect",
  },
  {
    id: "q-streaming-chat",
    title: "流式聊天逐 token 更新，如何防掉帧、串消息和自动滚动抢控制？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "聊天页面每收到一个 token 都重渲染整段会话。切换会话后旧流继续追加；用户向上阅读历史时，页面仍强制滚到底部。请提出状态、缓冲、清理与滚动策略。",
      followUps: [
        "取消请求后已有 buffer 和 requestAnimationFrame 如何清理？",
        "用 dangerouslySetInnerHTML 渲染模型输出有哪些边界？",
      ],
      checks: [
        "流和消息以 sessionId / messageId 关联，不靠当前数组下标",
        "批量刷新但保留最终 flush 与取消语义",
        "仅在用户接近底部时跟随，输出按不可信内容处理",
      ],
    },
    summary:
      "将流式消息与会话身份绑定，缓冲高频 token 并按帧或小时间窗刷新局部消息。自动滚动由用户是否仍在跟随底部决定。",
    points: [
      "切换会话时中止流、取消调度并丢弃旧 buffer；取消后到达的回调仍需检查会话 ID。",
      "对消息组件建立稳定边界，避免每个 token 让所有历史消息重复解析 Markdown。",
      "用户上滚时停止跟随并显示新内容提示，回到底部后恢复；图片加载造成的尺寸变化也需考虑。",
      "优先以文本渲染，Markdown / HTML 走明确的安全转换；不要把未过滤内容直接注入 DOM。",
    ],
    code: `// 高频输入缓冲关键片段；stop 时应同时取消流和 frame。
let buffer = '';
let frame = 0;
function onToken(token) {
  buffer += token;
  if (!frame) frame = requestAnimationFrame(() => {
    const chunk = buffer;
    buffer = ''; frame = 0;
    appendToMessage(sessionId, messageId, chunk);
  });
}
function stopBuffer() { cancelAnimationFrame(frame); buffer = ''; frame = 0; }
// 正常结束需 flush 剩余 buffer；取消则按产品规则保留或丢弃。`,
    takeaway: "实时体验的关键是控制更新边界，并尊重用户当前阅读位置。",
    source: "https://react.dev/learn/removing-effect-dependencies",
  },
  {
    id: "q-editable-virtual-table",
    title: "可编辑虚拟表格排序后，草稿与选中项如何保持正确？",
    group: "工程场景",
    interview: {
      kind: "场景设计",
      difficulty: "专家",
      prompt:
        "可编辑表格支持排序、虚拟滚动、跨页勾选与批量保存。用行下标保存草稿后数据错位，改用 key=id 后滚出视口的草稿仍消失。设计编辑与选择的数据模型。",
      followUps: [
        "排序、筛选、翻页后哪些状态该保留，哪些应该重置？",
        "部分行保存失败时，如何避免覆盖其余行的新草稿？",
      ],
      checks: [
        "业务身份、可见位置和组件生命周期分开",
        "草稿与选择保存在虚拟行外，按实体 ID 管理",
        "批量提交捕获每行 revision，逐项确认和报告失败",
      ],
    },
    summary:
      "稳定 key 修复同级匹配，不会替虚拟化卸载的行保管局部 state。将草稿、选中 ID 和提交版本保存在表格级或数据层。",
    points: [
      "使用 draftsById、selectedIds、errorsById；排序只是改变可见 ID 顺序，不改变业务身份。",
      "表格行可以被随时卸载与重建；输入值从外部草稿读取，未修改时回退到远端基线。",
      "批量保存按行捕获 revision，成功只清理仍对应同一次提交的草稿，失败保留可重试数据。",
      "定义“选择全部”是当前页、当前查询还是全部数据，不能仅凭前端已加载行推断。",
    ],
    code: `const displayedValue = draftsById[row.id]?.name ?? row.name;
function editRow(id, name) {
  setDrafts(previous => ({ ...previous,
    [id]: { ...previous[id], name, revision: (previous[id]?.revision ?? 0) + 1 },
  }));
}
<input value={displayedValue} onChange={e => editRow(row.id, e.target.value)} />;
// row.id 是业务身份；visibleIndex 只用于窗口位置计算。`,
    takeaway: "稳定 key 管身份，状态所有者管生命周期，两者不能互相替代。",
    source: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "q-lazy-retry",
    title: "懒加载 chunk 发布后 404，点“重试”为何仍失败？",
    group: "工程场景",
    interview: {
      kind: "故障排查",
      difficulty: "高级",
      prompt:
        "用户长时间停留旧页面，新版本发布后旧 hash 的 chunk 被删除。lazy import 失败进入错误边界，重置边界仍报错。请区分加载缓存、部署策略和恢复体验。",
      followUps: [
        "为什么不能简单在每次 render 中重新创建 lazy 组件？",
        "强制刷新前，未保存草稿如何处理？",
      ],
      checks: [
        "lazy 会缓存加载 Promise 及结果，重置边界不等于重新加载资源",
        "发布保留旧资产并正确配置 HTML 与 hash 资源缓存",
        "按错误类型提供可控恢复，避免刷新死循环",
      ],
    },
    summary:
      "重置 Error Boundary 只重试子树渲染，不能保证已缓存失败的 lazy 资源重新获取。chunk 已不存在时，需要部署保留策略与版本恢复。",
    points: [
      "发布时原子切换 HTML，保留仍有活跃客户端引用的旧 hash 资源；HTML 与静态资产采用不同缓存策略。",
      "离线错误可提示恢复网络，版本失配可引导保存草稿后刷新；不要对所有错误无条件 reload。",
      "如设计显式重建 lazy 资源，应只在受控重试边界中进行，而非每次渲染改变组件类型。",
      "为 chunk 加载失败采集资源地址、版本和网络信息，确认是缓存失配而非普通业务渲染异常。",
    ],
    code: `// 模块级声明保持组件类型稳定。
const Report = lazy(() => import('./Report'));
// ErrorBoundary 的“重置”只重新渲染，不自动清空上面 lazy 的加载缓存。
// 版本失配恢复按钮：先处理未保存草稿，再执行一次显式刷新。
function reloadAfterDraftSaved() {
  window.location.reload();
}`,
    takeaway: "资源加载失败既是渲染边界问题，也是发布与缓存一致性问题。",
    source: "https://react.dev/reference/react/lazy",
  },
];
