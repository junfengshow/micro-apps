import { useRef } from "react";

export default function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} aria-label="姓名" />
      <button onClick={() => inputRef.current?.focus()}>聚焦输入框</button>
    </>
  );
}
