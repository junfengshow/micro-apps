import { useEffect, useState } from "react";

function loadTopic(topic: string) {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(topic + " 的学习资料"), 500);
  });
}

export default function Reader() {
  const [topic, setTopic] = useState("React");
  const [text, setText] = useState("加载中…");
  useEffect(() => {
    let ignore = false;
    setText("加载中…");
    loadTopic(topic).then((result) => {
      if (!ignore) setText(result);
    });
    return () => {
      ignore = true;
    };
  }, [topic]);
  return (
    <>
      <select
        aria-label="主题"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      >
        <option>React</option>
        <option>TypeScript</option>
      </select>
      <p>{text}</p>
    </>
  );
}
