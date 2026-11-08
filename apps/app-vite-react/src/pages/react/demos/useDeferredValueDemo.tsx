import { memo, useDeferredValue, useState } from "react";

const Results = memo(function Results({ query }: { query: string }) {
  return <p>结果关键词：{query || "全部"}</p>;
});

export default function Search() {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  return (
    <>
      <input
        aria-label="搜索"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ opacity: text !== deferred ? 0.5 : 1 }}>
        <Results query={deferred} />
      </div>
    </>
  );
}
