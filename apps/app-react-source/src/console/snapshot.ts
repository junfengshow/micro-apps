export interface ValueSnapshot {
  kind: "value" | "string" | "object" | "reference";
  label: string;
  children?: { key: string; value: ValueSnapshot }[];
}

function objectType(value: object): string {
  // React 19 支持用普通对象创建 Fiber，不能只依赖 constructor.name。
  // 只读取数据属性描述符，类型识别也不执行 getter。
  const own = (key: string) => Object.getOwnPropertyDescriptor(value, key);
  const data = (key: string) => own(key)?.value;
  const has = (keys: string[]) =>
    keys.every((key) => {
      const descriptor = own(key);
      return descriptor && "value" in descriptor;
    });
  if (
    typeof data("tag") === "number" &&
    typeof data("flags") === "number" &&
    typeof data("lanes") === "number" &&
    has([
      "childLanes",
      "return",
      "child",
      "sibling",
      "alternate",
      "pendingProps",
      "memoizedProps",
      "memoizedState",
    ])
  )
    return "Fiber";
  if (
    has([
      "current",
      "containerInfo",
      "pendingLanes",
      "suspendedLanes",
      "pingCache",
      "callbackNode",
    ])
  )
    return "FiberRoot";
  if (has(["memoizedState", "baseState", "baseQueue", "queue", "next"]))
    return "Hook";
  const prototype = Object.getPrototypeOf(value);
  const constructor =
    prototype &&
    Object.getOwnPropertyDescriptor(prototype, "constructor")?.value;
  const name =
    typeof constructor === "function" &&
    Object.getOwnPropertyDescriptor(constructor, "name")?.value;
  if (name === "FiberNode") return "Fiber";
  if (name === "FiberRootNode") return "FiberRoot";
  return typeof name === "string" && name ? name.slice(0, 120) : "Object";
}

// 在打印调用栈内完成快照，不保存原始对象，也不在展开节点时重新读取对象。
// Fiber 含循环引用和大量字段，限制深度、节点数及文本量以免阻塞渲染。
export function snapshotArguments(args: readonly unknown[]): ValueSnapshot[] {
  const seen = new WeakMap<object, { path: string; type: string }>();
  let remainingNodes = 200;
  let remainingText = 16_000;
  function text(value: string): string {
    const length = Math.max(0, Math.min(remainingText, 2_000));
    remainingText -= Math.min(length, value.length);
    return value.length > length
      ? `${value.slice(0, length)}… [文本已截断]`
      : value;
  }
  function visit(value: unknown, path: string, depth: number): ValueSnapshot {
    if (--remainingNodes < 0)
      return { kind: "value", label: "[节点数已达上限]" };
    try {
      if (typeof value === "string")
        return { kind: "string", label: text(value) };
      if (typeof value === "function")
        return {
          kind: "value",
          label: text(`[Function ${value.name || "anonymous"}]`),
        };
      if (typeof value === "bigint")
        return { kind: "value", label: text(`${value}n`) };
      if (value === null || typeof value !== "object")
        return { kind: "value", label: text(String(value)) };
      const previous = seen.get(value);
      if (previous)
        return {
          kind: "reference",
          label: text(`↩ ${previous.type} ${previous.path}`),
        };
      const type = objectType(value);
      seen.set(value, { path, type });
      if (value instanceof Date)
        return {
          kind: "value",
          label: Number.isNaN(value.getTime())
            ? "Invalid Date"
            : value.toISOString(),
        };
      if (value instanceof RegExp)
        return { kind: "value", label: text(String(value)) };
      // 不保留 DOM 节点引用，也不遍历其内部实现。
      if (typeof Node !== "undefined" && value instanceof Node) {
        return {
          kind: "value",
          label: text(
            value.nodeType === 1
              ? `<${(value as Element).tagName.toLowerCase()}${(value as Element).id ? ` id="${(value as Element).id}"` : ""}>`
              : value.nodeName
          ),
        };
      }
      const map = value instanceof Map;
      const set = value instanceof Set;
      const array = Array.isArray(value);
      const error = value instanceof Error;
      const label = map
        ? `Map(${value.size})`
        : set
          ? `Set(${value.size})`
          : array
            ? `Array(${value.length})`
            : error
              ? text(`${value.name}: ${value.message}`)
              : type;
      if (depth >= 6)
        return { kind: "object", label: `${label} [深度已达上限]` };
      const children: NonNullable<ValueSnapshot["children"]> = [];
      function add(key: string, child: unknown) {
        const capturedKey = text(key);
        children.push({
          key: capturedKey,
          value: visit(
            child,
            `${path}.${capturedKey}`.slice(0, 500),
            depth + 1
          ),
        });
      }
      if (map || set) {
        let index = 0;
        for (const item of map ? value.entries() : value.values()) {
          if (index >= 24 || remainingNodes <= 0 || remainingText <= 0) break;
          if (map) {
            const [key, entry] = item;
            add(`${index}.key`, key);
            add(`${index}.value`, entry);
          } else add(String(index), item);
          index++;
        }
        if (index < value.size)
          children.push({
            key: "…",
            value: { kind: "value", label: "[其余成员已省略]" },
          });
      } else {
        const keys = Reflect.ownKeys(value);
        let count = 0;
        for (const key of keys) {
          if (array && key === "length") continue;
          if (count >= 24 || remainingNodes <= 0 || remainingText <= 0) break;
          const descriptor = Object.getOwnPropertyDescriptor(value, key);
          if (!descriptor) continue;
          // 不执行 getter，避免日志本身触发对象更新或抛异常。
          if ("value" in descriptor) add(String(key), descriptor.value);
          else
            children.push({
              key: text(String(key)),
              value: { kind: "value", label: "[Getter/Setter，未执行]" },
            });
          count++;
        }
        const total = keys.length - (array ? 1 : 0);
        if (count < total)
          children.push({
            key: "…",
            value: {
              kind: "value",
              label: `[已展示 ${count}/${total} 个属性]`,
            },
          });
      }
      return { kind: "object", label, children };
    } catch {
      return { kind: "value", label: "[无法读取该值]" };
    }
  }
  const values = args
    .slice(0, 16)
    .map((value, index) => visit(value, `$[${index}]`, 0));
  if (args.length > 16)
    values.push({ kind: "value", label: "[其余参数已省略]" });
  return values;
}
