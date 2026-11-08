import { useState } from "react";

export default function Products() {
  const [selected, setSelected] = useState("尚未选择");
  return (
    <>
      {["React", "TypeScript"].map((name) => (
        <button key={name} onClick={() => setSelected(name)}>
          {name}
        </button>
      ))}
      <p>已选择：{selected}</p>
    </>
  );
}
