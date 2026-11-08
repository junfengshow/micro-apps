import { useRef, useState } from "react";
import { flushSync } from "react-dom";

export default function ImmediateInput() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        onClick={() => {
          flushSync(() => setOpen(true));
          inputRef.current?.focus(); // 新 input 已提交，ref 已关联。
          console.log(open); // 首次点击仍为 false：旧快照。
        }}
      >
        打开并立即聚焦
      </button>
      {open && <input ref={inputRef} aria-label="新建条目" />}
    </>
  );
}
