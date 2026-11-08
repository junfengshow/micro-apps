import { useEffect, useState } from "react";

function Editor({ enabled }: { enabled: boolean }) {
  // 无论 enabled 如何变化，常规 Hook 顺序始终相同。
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const previous = document.title;
    document.title = "草稿：" + draft;
    return () => {
      document.title = previous;
    };
  }, [enabled, draft]);
  if (!enabled) return null;
  return (
    <input
      aria-label="草稿"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}

export default function HookStorageDemo() {
  const [enabled, setEnabled] = useState(true);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        显示编辑器（隐藏后仍保留草稿）
      </label>
      <Editor enabled={enabled} />
    </>
  );
}
