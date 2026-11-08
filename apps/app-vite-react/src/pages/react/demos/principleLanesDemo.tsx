import { memo, useState, useTransition } from "react";

const Results = memo(function Results({ query }: { query: string }) {
  return <p>列表当前使用的查询：{query}</p>;
});

export default function Search() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <input
        aria-label="搜索"
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next); // 输入保持紧急更新。
          startTransition(() => setQuery(next));
        }}
      />
      {isPending && <span role="status">更新结果中…</span>}
      <Results query={query} />
    </>
  );
}
