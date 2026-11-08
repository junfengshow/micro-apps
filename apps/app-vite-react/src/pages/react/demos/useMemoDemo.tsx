import { useMemo, useState } from "react";

const books = ["React 入门", "TypeScript 实践", "React 进阶"];

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => books.filter((book) => book.includes(query)),
    [query]
  );
  return (
    <>
      <input
        aria-label="查找书籍"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>{visible.join("、")}</p>
    </>
  );
}
