import { memo, useState } from "react";

const Heading = memo(function Heading({ title }: { title: string }) {
  return <h2>{title}</h2>;
});

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Heading title="稳定的字符串 prop" />
      <button onClick={() => setCount((n) => n + 1)}>{count}</button>
    </>
  );
}
