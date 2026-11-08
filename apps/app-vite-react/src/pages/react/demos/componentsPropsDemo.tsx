import { useState } from "react";
import type { ReactNode } from "react";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  const [likes, setLikes] = useState(0);
  return (
    <Panel title="组件组合">
      <button onClick={() => setLikes((n) => n + 1)}>赞 {likes}</button>
    </Panel>
  );
}
