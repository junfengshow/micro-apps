import type { LogEntry, LogStore } from "./store";
import type { ValueSnapshot } from "./snapshot";

// 原生 DOM 批量追加，避免显示日志再次触发 React Hooks / Fiber 源码日志。
export function mountLogView(container: HTMLElement, store: LogStore) {
  const document = container.ownerDocument;
  const viewport = document.createElement("div");
  viewport.className = "log-viewport";
  viewport.tabIndex = 0;
  viewport.setAttribute("aria-label", "日志列表");
  const list = document.createElement("ol");
  list.className = "log-list";
  viewport.append(list);
  container.replaceChildren(viewport);
  const nodes = new Map<number, HTMLLIElement>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  function valueNode(value: ValueSnapshot): HTMLElement {
    if (!value.children?.length) {
      const span = document.createElement("span");
      span.className = `snapshot-${value.kind}`;
      span.textContent =
        value.kind === "string" && value.label === "" ? "''" : value.label;
      return span;
    }
    const details = document.createElement("details");
    details.className = "snapshot-object";
    const summary = document.createElement("summary");
    summary.textContent = value.label;
    details.append(summary);
    // 展开时只创建 DOM，不重新读取原始对象。
    details.addEventListener("toggle", () => {
      if (!details.open || details.childElementCount > 1) return;
      const children = document.createElement("ul");
      for (const child of value.children!) {
        const item = document.createElement("li");
        const key = document.createElement("span");
        key.className = "snapshot-key";
        key.textContent = `${child.key}: `;
        const content = valueNode(child.value);
        if (child.key.includes("Str"))
          content.classList.add("snapshot-annotation");
        item.append(key, content);
        children.append(item);
      }
      details.append(children);
    });
    return details;
  }
  function entryNode(entry: LogEntry) {
    const item = document.createElement("li");
    item.className = `log-entry log-${entry.level} log-${entry.style}`;
    if (entry.scope !== "Console") {
      const scope = document.createElement("span");
      scope.className = "log-scope";
      scope.textContent = `[${entry.scope}]`;
      item.append(scope);
    }
    const args = document.createElement("div");
    args.className = "log-values";
    entry.values.forEach((value, index) => {
      const node = valueNode(value);
      if (index === 0 && value.kind === "string")
        node.classList.add("log-title");
      args.append(node);
    });
    item.append(args);
    return item;
  }
  function render() {
    timer = undefined;
    if (disposed) return;
    // 已上翻阅读时不打断；停留在底部时自动跟随新日志。
    const followTail =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 40;
    const entries = store.entries;
    const ids = new Set(entries.map((entry) => entry.id));
    for (const [id, node] of nodes)
      if (!ids.has(id)) {
        node.remove();
        nodes.delete(id);
      }
    const fragment = document.createDocumentFragment();
    for (const entry of entries)
      if (!nodes.has(entry.id)) {
        const node = entryNode(entry);
        nodes.set(entry.id, node);
        fragment.append(node);
      }
    list.append(fragment);
    if (followTail) viewport.scrollTop = viewport.scrollHeight;
  }
  function scheduleRender() {
    if (timer === undefined) timer = setTimeout(render, 40);
  }
  const unsubscribe = store.subscribe(scheduleRender);
  render();
  return () => {
    disposed = true;
    unsubscribe();
    if (timer !== undefined) clearTimeout(timer);
    container.replaceChildren();
  };
}
