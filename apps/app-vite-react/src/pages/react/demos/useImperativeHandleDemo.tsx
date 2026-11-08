import { useRef, useImperativeHandle } from "react";
import type { Ref } from "react";

type SearchHandle = { focus: () => void };

function SearchInput({ ref }: { ref: Ref<SearchHandle> }) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      focus: () => input.current?.focus(),
    }),
    []
  );
  return <input ref={input} aria-label="搜索" />;
}

export default function App() {
  const search = useRef<SearchHandle>(null);
  return (
    <>
      <SearchInput ref={search} />
      <button onClick={() => search.current?.focus()}>开始搜索</button>
    </>
  );
}
