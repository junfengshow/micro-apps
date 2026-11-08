import { memo, useCallback, useState } from "react";

const AddButton = memo(function AddButton({ onAdd }: { onAdd: () => void }) {
  return <button onClick={onAdd}>增加</button>;
});

export default function Counter() {
  const [count, setCount] = useState(0);
  const add = useCallback(() => setCount((n) => n + 1), []);
  return (
    <>
      <p>{count}</p>
      <AddButton onAdd={add} />
    </>
  );
}
