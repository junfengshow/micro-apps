import { useDebugValue, useState } from "react";

function useToggle(initial = false) {
  const [enabled, setEnabled] = useState(initial);
  useDebugValue(enabled, (value) => (value ? "开启" : "关闭"));
  return [enabled, () => setEnabled((value) => !value)] as const;
}

export default function Switch() {
  const [enabled, toggle] = useToggle();
  return <button onClick={toggle}>{enabled ? "开启" : "关闭"}</button>;
}
