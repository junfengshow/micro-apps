import { useState } from "react";

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  return { value, toggle: () => setValue((v) => !v) };
}

export default function Toggles() {
  const first = useToggle();
  const second = useToggle();
  return (
    <>
      <button onClick={first.toggle}>A：{String(first.value)}</button>
      <button onClick={second.toggle}>B：{String(second.value)}</button>
    </>
  );
}
