import { useState } from "react";

function Draft({ name }: { name: string }) {
  const [text, setText] = useState("");
  return (
    <input
      aria-label={name + " 的草稿"}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
}

export default function Editor() {
  const [person, setPerson] = useState("林");
  return (
    <>
      <button onClick={() => setPerson((p) => (p === "林" ? "陈" : "林"))}>
        切换用户（当前：{person}）
      </button>
      <Draft key={person} name={person} />
    </>
  );
}
