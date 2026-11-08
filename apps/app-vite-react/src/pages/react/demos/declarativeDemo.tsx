import { useState } from "react";

export default function Greeting() {
  const [name, setName] = useState("React");
  const message = "你好，" + (name.trim() || "朋友");
  return (
    <>
      <input
        aria-label="姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <h2>{message}</h2>
    </>
  );
}
